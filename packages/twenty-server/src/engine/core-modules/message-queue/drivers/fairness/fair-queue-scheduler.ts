import { PRIORITY_LIMIT, type RedisClient } from 'bullmq';
import { isDefined } from 'twenty-shared/utils';

import {
  FAIR_TICKET_OFFSET,
  URGENT_FAIR_PRIORITY,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { FairTicketAllocator } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-ticket-allocator';
import { type QueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { buildQueueJobGroupKeys } from 'src/engine/core-modules/message-queue/utils/build-queue-job-group-keys.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

export type FairJobOptions = { priority?: number; fairBase?: number };

type FairQueueSchedulerOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  getJobKey: (job: { queueName: MessageQueue; jobId: string }) => string;
  keyPrefix: string;
  metricsService: MetricsService;
};

export class FairQueueScheduler {
  private readonly fairTicketAllocator: FairTicketAllocator;

  constructor(private readonly options: FairQueueSchedulerOptions) {
    this.fairTicketAllocator = new FairTicketAllocator({
      getClient: options.getClient,
      getJobKey: options.getJobKey,
      keyPrefix: options.keyPrefix,
    });
  }

  async computeJobOptions({
    queueName,
    scopes,
    additionalGroupKeys,
    delay,
    staticPriority,
  }: {
    queueName: MessageQueue;
    scopes: QueueJobScope[];
    additionalGroupKeys?: string[];
    delay: number | undefined;
    staticPriority: number | undefined;
  }): Promise<FairJobOptions[]> {
    const staticJobOptions: FairJobOptions[] = scopes.map(() => ({
      priority: staticPriority,
    }));

    if ((delay ?? 0) > 0) {
      return staticJobOptions;
    }

    const requestByGroupKeys = new Map<
      string,
      { groupKeys: string[]; jobIndexes: number[] }
    >();

    scopes.forEach((scope, jobIndex) => {
      const groupKeys = buildQueueJobGroupKeys({ scope, additionalGroupKeys });
      const signature = JSON.stringify(groupKeys);
      const request = requestByGroupKeys.get(signature) ?? {
        groupKeys,
        jobIndexes: [],
      };

      request.jobIndexes.push(jobIndex);
      requestByGroupKeys.set(signature, request);
    });

    const requests = [...requestByGroupKeys.values()];
    const fairTickets = await this.fairTicketAllocator.allocateTickets({
      queueName,
      requests: requests.map(({ groupKeys, jobIndexes }) => ({
        groupKeys,
        jobCount: jobIndexes.length,
      })),
    });

    if (staticPriority === URGENT_FAIR_PRIORITY) {
      return staticJobOptions;
    }

    if (!isDefined(fairTickets)) {
      void this.options.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobFairTagFallback,
        attributes: { queue: queueName },
        shouldStoreInCache: false,
      });

      return staticJobOptions;
    }

    const { base, tickets } = fairTickets;
    const fairJobOptions = [...staticJobOptions];

    requests.forEach(({ jobIndexes }, requestIndex) => {
      const { tag, weight } = tickets[requestIndex];

      jobIndexes.forEach((jobIndex, position) => {
        const ticket = Math.floor(tag + position / weight);

        fairJobOptions[jobIndex] = {
          priority:
            FAIR_TICKET_OFFSET +
            Math.min(PRIORITY_LIMIT - FAIR_TICKET_OFFSET, Math.max(0, ticket)),
          fairBase: base,
        };
      });
    });

    return fairJobOptions;
  }

  onJobStarted({
    queueName,
    jobId,
  }: {
    queueName: MessageQueue;
    jobId: string;
  }): void {
    void this.fairTicketAllocator.recordDispatch({ queueName, jobId });
  }
}
