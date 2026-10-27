import { createHash } from 'node:crypto';

import { Logger } from '@nestjs/common';

import { type RedisClient } from 'bullmq';

import { FAIR_CLOCK_TTL_MS } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { FAIR_TAG_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-tag-script.constant';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FairReservation = { groupKeys: string[]; batchSize: number };

export type FairTicket = { tag: number; weight: number };

type FairPriorityTaggerOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  keyPrefix: string;
};

const FAIR_TAG_SCRIPT_SHA = createHash('sha1')
  .update(FAIR_TAG_SCRIPT)
  .digest('hex');

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
    const fairKeyPrefix = `${this.options.keyPrefix}:${queueName}:fair:`;
    const distinctGroupKeys = [
      ...new Set(reservations.flatMap(({ groupKeys }) => groupKeys)),
    ];
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
      reservations.length,
      ...reservations.flatMap(({ groupKeys, batchSize }) => [
        batchSize,
        groupKeys.length,
        ...groupKeys.map((groupKey) => distinctGroupKeys.indexOf(groupKey) + 1),
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
        .catch(() =>
          client.runCommand('eval', [
            FAIR_TAG_SCRIPT,
            keys.length,
            ...keys,
            ...args,
          ]),
        );
      const values = String(rawTickets).split(' ').map(Number);
      const tickets = reservations.map((_, index) => ({
        tag: values[2 * index],
        weight: values[2 * index + 1],
      }));
      const hasValidTickets =
        values.length === 2 * reservations.length &&
        tickets.every(({ tag, weight }) => Number.isFinite(tag) && weight > 0);

      if (!hasValidTickets) {
        throw new Error(`unexpected tickets "${String(rawTickets)}"`);
      }

      return tickets;
    } catch (error) {
      this.logger.warn(
        `Failed to reserve the fair tickets on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    }
  }
}
