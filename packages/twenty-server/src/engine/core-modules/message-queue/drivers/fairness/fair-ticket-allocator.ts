import { createHash } from 'node:crypto';

import { Logger } from '@nestjs/common';

import { type RedisClient } from 'bullmq';
import { isDefined } from 'twenty-shared/utils';

import { FAIR_DISPATCH_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-dispatch-script.constant';
import {
  FAIR_CLOCK_TTL_MS,
  FAIR_TICKET_OFFSET,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { FAIR_TAG_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-tag-script.constant';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type FairTicketRequest = { groupKeys: string[]; jobCount: number };

export type FairTicket = { tag: number; weight: number };

type FairTicketAllocatorOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  getJobKey: (job: { queueName: MessageQueue; jobId: string }) => string;
  keyPrefix: string;
};

export class FairTicketAllocator {
  private readonly logger = new Logger(FairTicketAllocator.name);
  private readonly scriptShas = new Map<string, string>();

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

    try {
      const rawTickets = await this.runScript({
        queueName,
        script: FAIR_TAG_SCRIPT,
        keys: [
          `${fairKeyPrefix}vtime`,
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

  async recordDispatch({
    queueName,
    jobId,
  }: {
    queueName: MessageQueue;
    jobId: string;
  }): Promise<void> {
    const fairKeyPrefix = `${this.options.keyPrefix}:${queueName}:fair:`;

    try {
      await this.runScript({
        queueName,
        script: FAIR_DISPATCH_SCRIPT,
        keys: [
          `${fairKeyPrefix}vtime`,
          this.options.getJobKey({ queueName, jobId }),
        ],
        args: [FAIR_TICKET_OFFSET],
      });
    } catch (error) {
      this.logger.warn(
        `Failed to record the fair dispatch of job ${jobId} on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
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
