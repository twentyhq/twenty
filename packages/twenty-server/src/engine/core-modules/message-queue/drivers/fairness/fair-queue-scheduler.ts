import { PRIORITY_LIMIT, type RedisClient } from 'bullmq';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  FAIR_TICKET_OFFSET,
  URGENT_FAIR_PRIORITY,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { FairTicketAllocator } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-ticket-allocator';
import { GroupRatePacer } from 'src/engine/core-modules/message-queue/drivers/fairness/group-rate-pacer';
import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueGroupRateLimit } from 'src/engine/core-modules/message-queue/types/message-queue-group-rate-limit.type';
import { getDefaultGroupKeys } from 'src/engine/core-modules/message-queue/utils/get-default-group-keys.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type FairJobOptions = {
  priority?: number;
  fairBase?: number;
  delay?: number;
};

type GroupKeysRequest = { groupKeys: string[]; jobIndexes: number[] };

type FairQueueSchedulerOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  getJobKey: (job: { queueName: MessageQueue; jobId: string }) => string;
  keyPrefix: string;
  getGroupRateLimits: (
    queueName: MessageQueue,
  ) => Partial<Record<string, MessageQueueGroupRateLimit>> | undefined;
  metricsService: MetricsService;
  twentyConfigService: TwentyConfigService;
};

export class FairQueueScheduler {
  private readonly fairTicketAllocator: FairTicketAllocator;
  private readonly groupRatePacer: GroupRatePacer;

  constructor(private readonly options: FairQueueSchedulerOptions) {
    this.fairTicketAllocator = new FairTicketAllocator({
      getClient: options.getClient,
      getJobKey: options.getJobKey,
      keyPrefix: options.keyPrefix,
    });
    this.groupRatePacer = new GroupRatePacer({
      getClient: options.getClient,
      keyPrefix: options.keyPrefix,
      metricsService: options.metricsService,
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
    const requests = this.groupJobsByGroupKeys({
      jobsData,
      groupKeys: options?.groupKeys,
    });
    const callerDelayMs = options?.delay ?? 0;
    const [fairJobOptions, pacedDelays] = await Promise.all([
      this.computeFairJobOptions({
        queueName,
        jobCount: jobsData.length,
        requests,
        callerDelayMs,
        staticPriority,
      }),
      staticPriority === URGENT_FAIR_PRIORITY
        ? undefined
        : this.computePacedDelays({
            queueName,
            jobCount: jobsData.length,
            requests,
          }),
    ]);

    return fairJobOptions.map((jobOptions, jobIndex) => {
      const pacedDelayMs = pacedDelays?.[jobIndex] ?? 0;

      return pacedDelayMs > callerDelayMs
        ? { ...jobOptions, delay: pacedDelayMs }
        : jobOptions;
    });
  }

  private groupJobsByGroupKeys({
    jobsData,
    groupKeys,
  }: {
    jobsData: unknown[];
    groupKeys: string[] | undefined;
  }): GroupKeysRequest[] {
    const requestByGroupKeys = new Map<string, GroupKeysRequest>();

    jobsData.forEach((jobData, jobIndex) => {
      const jobGroupKeys = isNonEmptyArray(groupKeys)
        ? [...new Set(groupKeys)]
        : getDefaultGroupKeys(jobData);
      const signature = JSON.stringify(jobGroupKeys);
      const request = requestByGroupKeys.get(signature) ?? {
        groupKeys: jobGroupKeys,
        jobIndexes: [],
      };

      request.jobIndexes.push(jobIndex);
      requestByGroupKeys.set(signature, request);
    });

    return [...requestByGroupKeys.values()];
  }

  private async computeFairJobOptions({
    queueName,
    jobCount,
    requests,
    callerDelayMs,
    staticPriority,
  }: {
    queueName: MessageQueue;
    jobCount: number;
    requests: GroupKeysRequest[];
    callerDelayMs: number;
    staticPriority: number | undefined;
  }): Promise<FairJobOptions[]> {
    const staticJobOptions: FairJobOptions[] = Array.from(
      { length: jobCount },
      () => ({ priority: staticPriority }),
    );

    if (!this.isFairnessEnabled() || callerDelayMs > 0) {
      return staticJobOptions;
    }

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

  private async computePacedDelays({
    queueName,
    jobCount,
    requests,
  }: {
    queueName: MessageQueue;
    jobCount: number;
    requests: GroupKeysRequest[];
  }): Promise<number[] | undefined> {
    const groupRateLimits = this.options.getGroupRateLimits(queueName);

    if (
      !this.isGroupRateLimitEnabled(queueName) ||
      !isDefined(groupRateLimits)
    ) {
      return undefined;
    }

    const delaysByRequest = await this.groupRatePacer.computeDelays({
      queueName,
      requests: requests.map(({ groupKeys, jobIndexes }) => ({
        groupKeys,
        jobCount: jobIndexes.length,
      })),
      groupRateLimits,
    });

    if (!isDefined(delaysByRequest)) {
      return undefined;
    }

    const pacedDelays = new Array<number>(jobCount).fill(0);

    requests.forEach(({ jobIndexes }, requestIndex) => {
      jobIndexes.forEach((jobIndex, position) => {
        pacedDelays[jobIndex] = delaysByRequest[requestIndex][position];
      });
    });

    if (pacedDelays.some((delayMs) => delayMs > 0)) {
      void this.options.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobGroupRatePaced,
        attributes: { queue: queueName },
        shouldStoreInCache: false,
      });
    }

    return pacedDelays;
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

  isGroupRateLimitEnabled(queueName: MessageQueue): boolean {
    return (
      this.options.twentyConfigService.get(
        'IS_WORKER_GROUP_RATE_LIMIT_ENABLED',
      ) && isDefined(this.options.getGroupRateLimits(queueName))
    );
  }

  private isFairnessEnabled(): boolean {
    return this.options.twentyConfigService.get('IS_WORKER_FAIRNESS_ENABLED');
  }
}
