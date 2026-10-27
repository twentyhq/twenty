import { createHash } from 'node:crypto';

import { Logger } from '@nestjs/common';

import { type RedisClient } from 'bullmq';
import { isDefined } from 'twenty-shared/utils';

import { FAIR_CLOCK_TTL_MS } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { FAIR_TAG_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-tag-script.constant';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FairReservation = { groupKeys: string[]; batchSize: number };

export type FairTicket = { tag: number; weight: number };

type FairPriorityTaggerOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  keyPrefix: string;
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

export class FairPriorityTagger {
  private readonly logger = new Logger(FairPriorityTagger.name);

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
