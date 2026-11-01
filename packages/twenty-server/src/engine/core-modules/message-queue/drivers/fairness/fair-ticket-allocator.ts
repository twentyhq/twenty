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
  FAIR_REBASE_STEP,
  FAIR_REBASE_THRESHOLD,
  FAIR_TICKET_OFFSET,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { FAIR_REBASE_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-rebase-script.constant';
import { FAIR_TAG_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-tag-script.constant';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FairTicketRequest = { groupKeys: string[]; jobCount: number };

export type FairTicket = { tag: number; weight: number };

export type FairTickets = { base: number; tickets: FairTicket[] };

type FairTicketAllocatorOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  getJobKey: (job: { queueName: MessageQueue; jobId: string }) => string;
  keyPrefix: string;
  rebaseGraceMs?: number;
};

export class FairTicketAllocator {
  private readonly logger = new Logger(FairTicketAllocator.name);
  private readonly rebasesInProgress = new Map<MessageQueue, Promise<void>>();
  private readonly scriptShas = new Map<string, string>();

  constructor(private readonly options: FairTicketAllocatorOptions) {}

  async allocateTickets({
    queueName,
    requests,
  }: {
    queueName: MessageQueue;
    requests: FairTicketRequest[];
  }): Promise<FairTickets | undefined> {
    const fairKeyPrefix = `${this.options.keyPrefix}:${queueName}:fair:`;
    const distinctGroupKeys = [
      ...new Set(requests.flatMap(({ groupKeys }) => groupKeys)),
    ];
    const groupKeyIndexes = new Map(
      distinctGroupKeys.map((groupKey, index) => [groupKey, index + 1]),
    );

    try {
      const rawTickets = await this.runScript({
        queueName,
        script: FAIR_TAG_SCRIPT,
        keys: [
          `${fairKeyPrefix}vtime`,
          `${fairKeyPrefix}base`,
          `${fairKeyPrefix}weights`,
          ...distinctGroupKeys.map(
            (groupKey) => `${fairKeyPrefix}clock:${groupKey}`,
          ),
        ],
        args: [
          FAIR_CLOCK_TTL_MS,
          distinctGroupKeys.length,
          ...distinctGroupKeys,
          requests.length,
          ...requests.flatMap(({ groupKeys, jobCount }) => [
            jobCount,
            groupKeys.length,
            ...groupKeys.map((groupKey) => groupKeyIndexes.get(groupKey) ?? 0),
          ]),
        ],
      });
      const [base, ...values] = String(rawTickets).split(' ').map(Number);
      const tickets = requests.map((_, index) => ({
        tag: values[2 * index],
        weight: values[2 * index + 1],
      }));
      const hasValidTickets =
        Number.isInteger(base) &&
        base >= 0 &&
        values.length === 2 * requests.length &&
        tickets.every(({ tag, weight }) => Number.isFinite(tag) && weight > 0);

      if (!hasValidTickets) {
        throw new Error(`unexpected tickets "${String(rawTickets)}"`);
      }

      return { base, tickets };
    } catch (error) {
      this.logger.warn(
        `Failed to allocate the fair tickets on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    }
  }

  async recordDispatch({
    queueName,
    jobId,
  }: {
    queueName: MessageQueue;
    jobId: string;
  }): Promise<void> {
    const fairKeyPrefix = `${this.options.keyPrefix}:${queueName}:fair:`;

    try {
      const rebaseState = Number(
        await this.runScript({
          queueName,
          script: FAIR_DISPATCH_SCRIPT,
          keys: [
            `${fairKeyPrefix}vtime`,
            `${fairKeyPrefix}base`,
            `${fairKeyPrefix}rebase`,
            this.options.getJobKey({ queueName, jobId }),
          ],
          args: [FAIR_REBASE_THRESHOLD, FAIR_REBASE_STEP, FAIR_TICKET_OFFSET],
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
      this.logger.warn(
        `Failed to record the fair dispatch of job ${jobId} on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

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
    const queueKeyPrefix = `${this.options.keyPrefix}:${queueName}:`;

    try {
      for (let chunk = 0; chunk < FAIR_REBASE_MAX_CHUNKS; chunk += 1) {
        const rawResult = await this.runScript({
          queueName,
          script: FAIR_REBASE_SCRIPT,
          keys: [
            `${queueKeyPrefix}fair:rebase`,
            `${queueKeyPrefix}prioritized`,
            `${queueKeyPrefix}delayed`,
            `${queueKeyPrefix}active`,
            `${queueKeyPrefix}fair:base`,
          ],
          args: [
            FAIR_REBASE_STEP,
            FAIR_REBASE_CHUNK_SIZE,
            queueKeyPrefix,
            Date.now(),
            this.options.rebaseGraceMs ?? FAIR_REBASE_GRACE_MS,
            FAIR_TICKET_OFFSET,
          ],
        });

        if (!Array.isArray(rawResult)) {
          throw new Error(`unexpected rebase result "${String(rawResult)}"`);
        }

        const state = Number(rawResult[0]);

        if (state === 0) {
          return;
        }

        if (state === 2) {
          const waitMs = Math.max(0, Number(rawResult[1]));

          await new Promise<void>((resolve) => {
            setTimeout(resolve, waitMs).unref();
          });
        }
      }

      throw new Error(`still pending after ${FAIR_REBASE_MAX_CHUNKS} chunks`);
    } catch (error) {
      this.logger.warn(
        `Failed to rebase the fair tickets on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
      );
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
    const scriptSha = this.getScriptSha(script);

    return client
      .runCommand('evalsha', [scriptSha, keys.length, ...keys, ...args])
      .catch((error: unknown) => {
        if (!(error instanceof Error && error.message.startsWith('NOSCRIPT'))) {
          throw error;
        }

        return client.runCommand('eval', [
          script,
          keys.length,
          ...keys,
          ...args,
        ]);
      });
  }

  private getScriptSha(script: string): string {
    const cachedScriptSha = this.scriptShas.get(script);

    if (isDefined(cachedScriptSha)) {
      return cachedScriptSha;
    }

    const scriptSha = createHash('sha1').update(script).digest('hex');

    this.scriptShas.set(script, scriptSha);

    return scriptSha;
  }
}
