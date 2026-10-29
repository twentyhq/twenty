import { createHash } from 'node:crypto';

import { Logger } from '@nestjs/common';

import { type RedisClient } from 'bullmq';

import { FAIR_CLOCK_TTL_MS } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { FAIR_TAG_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-tag-script.constant';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FairTicketRequest = { groupKeys: string[]; jobCount: number };

export type FairTicket = { tag: number; weight: number };

type FairTicketAllocatorOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  keyPrefix: string;
};

const FAIR_TAG_SCRIPT_SHA = createHash('sha1')
  .update(FAIR_TAG_SCRIPT)
  .digest('hex');

export class FairTicketAllocator {
  private readonly logger = new Logger(FairTicketAllocator.name);

  constructor(private readonly options: FairTicketAllocatorOptions) {}

  async allocateTickets({
    queueName,
    requests,
  }: {
    queueName: MessageQueue;
    requests: FairTicketRequest[];
  }): Promise<FairTicket[] | undefined> {
    const fairKeyPrefix = `${this.options.keyPrefix}:${queueName}:fair:`;
    const distinctGroupKeys = [
      ...new Set(requests.flatMap(({ groupKeys }) => groupKeys)),
    ];
    const groupKeyIndexes = new Map(
      distinctGroupKeys.map((groupKey, index) => [groupKey, index + 1]),
    );
    const keys = [
      `${fairKeyPrefix}vtime`,
      `${fairKeyPrefix}weights`,
      ...distinctGroupKeys.map(
        (groupKey) => `${fairKeyPrefix}clock:${groupKey}`,
      ),
    ];
    const args = [
      FAIR_CLOCK_TTL_MS,
      distinctGroupKeys.length,
      ...distinctGroupKeys,
      requests.length,
      ...requests.flatMap(({ groupKeys, jobCount }) => [
        jobCount,
        groupKeys.length,
        ...groupKeys.map((groupKey) => groupKeyIndexes.get(groupKey) ?? 0),
      ]),
    ];

    try {
      const client = await this.options.getClient(queueName);
      const rawTickets = await client
        .runCommand('evalsha', [
          FAIR_TAG_SCRIPT_SHA,
          keys.length,
          ...keys,
          ...args,
        ])
        .catch((error: unknown) => {
          if (
            !(error instanceof Error && error.message.startsWith('NOSCRIPT'))
          ) {
            throw error;
          }

          return client.runCommand('eval', [
            FAIR_TAG_SCRIPT,
            keys.length,
            ...keys,
            ...args,
          ]);
        });
      const values = String(rawTickets).split(' ').map(Number);
      const tickets = requests.map((_, index) => ({
        tag: values[2 * index],
        weight: values[2 * index + 1],
      }));
      const hasValidTickets =
        values.length === 2 * requests.length &&
        tickets.every(({ tag, weight }) => Number.isFinite(tag) && weight > 0);

      if (!hasValidTickets) {
        throw new Error(`unexpected tickets "${String(rawTickets)}"`);
      }

      return tickets;
    } catch (error) {
      this.logger.warn(
        `Failed to allocate the fair tickets on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    }
  }
}
