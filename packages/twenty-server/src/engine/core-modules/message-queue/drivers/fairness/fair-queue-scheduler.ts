import { PRIORITY_LIMIT, type RedisClient } from 'bullmq';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  FAIR_TICKET_OFFSET,
  URGENT_FAIR_PRIORITY,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { FairTicketAllocator } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-ticket-allocator';
import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getDefaultGroupKeys } from 'src/engine/core-modules/message-queue/utils/get-default-group-keys.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type FairJobOptions = { priority?: number; fairBase?: number };

type FairQueueSchedulerOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  getJobKey: (job: { queueName: MessageQueue; jobId: string }) => string;
  keyPrefix: string;
  metricsService: MetricsService;
  twentyConfigService: TwentyConfigService;
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
    jobsData,
    options,
    staticPriority,
  }: {
    queueName: MessageQueue;
    jobsData: unknown[];
    options?: Pick<QueueJobOptions, 'groupKeys' | 'delay'>;
    staticPriority: number | undefined;
  }): Promise<FairJobOptions[]> {
    const staticJobOptions: FairJobOptions[] = jobsData.map(() => ({
      priority: staticPriority,
    }));

    if (!this.isFairnessEnabled() || (options?.delay ?? 0) > 0) {
      return staticJobOptions;
    }

    const requestByGroupKeys = new Map<
      string,
      { groupKeys: string[]; jobIndexes: number[] }
    >();

    jobsData.forEach((jobData, jobIndex) => {
      const groupKeys = isNonEmptyArray(options?.groupKeys)
        ? [...new Set(options.groupKeys)]
        : getDefaultGroupKeys(jobData);
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
    if (!this.isFairnessEnabled()) {
      return;
    }

    void this.fairTicketAllocator.recordDispatch({ queueName, jobId });
  }

  private isFairnessEnabled(): boolean {
    return this.options.twentyConfigService.get('IS_WORKER_FAIRNESS_ENABLED');
  }
}
