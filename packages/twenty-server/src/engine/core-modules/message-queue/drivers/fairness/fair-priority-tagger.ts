import { createHash } from 'node:crypto';

import { Logger } from '@nestjs/common';

import { type RedisClient } from 'bullmq';
import { isDefined } from 'twenty-shared/utils';

import { FAIR_DISPATCH_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-dispatch-script.constant';
import {
  FAIR_CLOCK_TTL_MS,
  FAIR_REBASE_CHUNK_SIZE,
  FAIR_REBASE_GRACE_MS,
  FAIR_REBASE_MAX_CHUNKS,
  FAIR_REBASE_OLD_SCALE_FLOOR,
  FAIR_REBASE_STEP,
  FAIR_REBASE_THRESHOLD,
  FAIR_TICKET_OFFSET,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { FAIR_REBASE_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-rebase-script.constant';
import { FAIR_TAG_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-tag-script.constant';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FairReservation = { groupKeys: string[]; batchSize: number };

export type FairTicket = { tag: number; weight: number };

type FairPriorityTaggerOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  keyPrefix: string;
  rebaseGraceMs?: number;
};

const scriptShaByScript = new Map<string, string>();

const getScriptSha = (script: string): string => {
  const cachedSha = scriptShaByScript.get(script);

  if (isDefined(cachedSha)) {
    return cachedSha;
  }

  const sha = createHash('sha1').update(script).digest('hex');

  scriptShaByScript.set(script, sha);

  return sha;
};

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds).unref();
  });

export class FairPriorityTagger {
  private readonly logger = new Logger(FairPriorityTagger.name);
  private readonly rebasesInProgress = new Map<MessageQueue, Promise<void>>();

  constructor(private readonly options: FairPriorityTaggerOptions) {}

  async reserve({
    queueName,
    reservations,
  }: {
    queueName: MessageQueue;
    reservations: FairReservation[];
  }): Promise<FairTicket[] | undefined> {
    try {
      const distinctGroupKeys = [
        ...new Set(reservations.flatMap(({ groupKeys }) => groupKeys)),
      ];
      const indexByGroupKey = new Map(
        distinctGroupKeys.map((groupKey, index) => [groupKey, index + 1]),
      );
      const rawTickets = await this.runScript({
        queueName,
        script: FAIR_TAG_SCRIPT,
        keys: [
          this.buildFairKey({ queueName, suffix: 'vtime' }),
          this.buildFairKey({ queueName, suffix: 'base' }),
          this.buildFairKey({ queueName, suffix: 'weights' }),
          ...distinctGroupKeys.map((groupKey) =>
            this.buildFairKey({ queueName, suffix: `clock:${groupKey}` }),
          ),
        ],
        args: [
          FAIR_CLOCK_TTL_MS,
          distinctGroupKeys.length,
          ...distinctGroupKeys,
          reservations.length,
          ...reservations.flatMap(({ groupKeys, batchSize }) => [
            batchSize,
            groupKeys.length,
            ...groupKeys.map((groupKey) => indexByGroupKey.get(groupKey) ?? 0),
          ]),
        ],
      });
      const tickets = this.parseTickets({
        rawTickets,
        count: reservations.length,
      });

      if (!isDefined(tickets)) {
        this.warn({
          queueName,
          action: 'parse the fair tickets',
          error: rawTickets,
        });

        return undefined;
      }

      return tickets;
    } catch (error) {
      this.warn({ queueName, action: 'reserve the fair tickets', error });

      return undefined;
    }
  }

  // The ticket is read inside the script: a worker's copy of the job can predate a rebase
  async dispatched({
    queueName,
    jobId,
  }: {
    queueName: MessageQueue;
    jobId: string;
  }): Promise<void> {
    try {
      const rebaseState = Number(
        await this.runScript({
          queueName,
          script: FAIR_DISPATCH_SCRIPT,
          keys: [
            this.buildFairKey({ queueName, suffix: 'vtime' }),
            this.buildFairKey({ queueName, suffix: 'base' }),
            this.buildFairKey({ queueName, suffix: 'rebase' }),
            this.buildQueueKey({ queueName, suffix: 'prioritized' }),
          ],
          args: [
            this.buildQueueKey({ queueName, suffix: jobId }),
            FAIR_REBASE_THRESHOLD,
            FAIR_REBASE_STEP,
            FAIR_TICKET_OFFSET,
            FAIR_REBASE_OLD_SCALE_FLOOR,
          ],
        }),
      );

      if (rebaseState === 1) {
        this.logger.log(
          `Rebasing the fair tickets of queue ${queueName} by ${FAIR_REBASE_STEP}`,
        );
      }

      if (rebaseState > 0) {
        void this.rebase(queueName);
      }
    } catch (error) {
      this.warn({ queueName, action: 'record the fair dispatch', error });
    }
  }

  // Rewrites the old-scale tickets one bounded chunk at a time, so Redis is never held for a whole backlog
  rebase(queueName: MessageQueue): Promise<void> {
    const rebaseInProgress = this.rebasesInProgress.get(queueName);

    if (isDefined(rebaseInProgress)) {
      return rebaseInProgress;
    }

    const rebase = this.runRebase(queueName).finally(() => {
      this.rebasesInProgress.delete(queueName);
    });

    this.rebasesInProgress.set(queueName, rebase);

    return rebase;
  }

  private async runRebase(queueName: MessageQueue): Promise<void> {
    try {
      for (let chunk = 0; chunk < FAIR_REBASE_MAX_CHUNKS; chunk += 1) {
        const rawResult = await this.runScript({
          queueName,
          script: FAIR_REBASE_SCRIPT,
          keys: [
            this.buildFairKey({ queueName, suffix: 'rebase' }),
            this.buildQueueKey({ queueName, suffix: 'prioritized' }),
            this.buildQueueKey({ queueName, suffix: 'delayed' }),
            this.buildQueueKey({ queueName, suffix: 'active' }),
          ],
          args: [
            FAIR_REBASE_STEP,
            FAIR_TICKET_OFFSET + FAIR_REBASE_OLD_SCALE_FLOOR,
            FAIR_REBASE_CHUNK_SIZE,
            this.buildQueueKey({ queueName, suffix: '' }),
            Date.now(),
            this.options.rebaseGraceMs ?? FAIR_REBASE_GRACE_MS,
          ],
        });
        const rebaseResult = this.parseRebaseResult(rawResult);

        if (!isDefined(rebaseResult)) {
          this.warn({
            queueName,
            action: 'parse the fair rebase result',
            error: rawResult,
          });

          return;
        }

        const [state, waitMs] = rebaseResult;

        if (state === 0) {
          return;
        }

        if (state === 2) {
          await sleep(waitMs);
        }
      }

      this.warn({
        queueName,
        action: 'finish the fair rebase',
        error: `still pending after ${FAIR_REBASE_MAX_CHUNKS} chunks`,
      });
    } catch (error) {
      this.warn({ queueName, action: 'rebase the fair tickets', error });
    }
  }

  private async runScript({
    queueName,
    script,
    keys,
    args,
  }: {
    queueName: MessageQueue;
    script: string;
    keys: string[];
    args: (string | number)[];
  }): Promise<unknown> {
    const client = await this.options.getClient(queueName);

    try {
      return await client.runCommand('evalsha', [
        getScriptSha(script),
        keys.length,
        ...keys,
        ...args,
      ]);
    } catch {
      return client.runCommand('eval', [script, keys.length, ...keys, ...args]);
    }
  }

  private parseTickets({
    rawTickets,
    count,
  }: {
    rawTickets: unknown;
    count: number;
  }): FairTicket[] | undefined {
    const values = String(rawTickets).split(' ');

    if (values.length !== 2 * count) {
      return undefined;
    }

    const tickets = Array.from({ length: count }, (_, index) => ({
      tag: Number(values[2 * index]),
      weight: Number(values[2 * index + 1]),
    }));

    return tickets.every(
      ({ tag, weight }) => Number.isFinite(tag) && weight > 0,
    )
      ? tickets
      : undefined;
  }

  private parseRebaseResult(rawResult: unknown): [number, number] | undefined {
    return Array.isArray(rawResult)
      ? [Number(rawResult[0]), Math.max(0, Number(rawResult[1]))]
      : undefined;
  }

  private warn({
    queueName,
    action,
    error,
  }: {
    queueName: MessageQueue;
    action: string;
    error: unknown;
  }): void {
    this.logger.warn(
      `Failed to ${action} on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  private buildFairKey({
    queueName,
    suffix,
  }: {
    queueName: MessageQueue;
    suffix: string;
  }): string {
    return this.buildQueueKey({ queueName, suffix: `fair:${suffix}` });
  }

  private buildQueueKey({
    queueName,
    suffix,
  }: {
    queueName: MessageQueue;
    suffix: string;
  }): string {
    return `${this.options.keyPrefix}:${queueName}:${suffix}`;
  }
}
