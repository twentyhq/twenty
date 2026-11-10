import { PRIORITY_LIMIT, type RedisClient } from 'bullmq';
import { isDefined } from 'twenty-shared/utils';

import {
  FAIR_TICKET_OFFSET,
  URGENT_FAIR_PRIORITY,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { FairTicketAllocator } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-ticket-allocator';
import { GroupRatePacer } from 'src/engine/core-modules/message-queue/drivers/fairness/group-rate-pacer';
import {
  type QueueJobLimiter,
  type QueueJobScope,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { buildPaceSlotKey } from 'src/engine/core-modules/message-queue/utils/build-pace-slot-key.util';
import { buildQueueJobGroupKeys } from 'src/engine/core-modules/message-queue/utils/build-queue-job-group-keys.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

export type FairJobOptions = {
  priority?: number;
  fairBase?: number;
  delay?: number;
};

type PacedJobsRequest = {
  slotKey: string;
  limiter: QueueJobLimiter;
  jobIndexes: number[];
};

type FairQueueSchedulerOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  getJobKey: (job: { queueName: MessageQueue; jobId: string }) => string;
  keyPrefix: string;
  metricsService: MetricsService;
  isGroupLimiterEnabled: () => boolean;
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
    scopes,
    limiters,
    additionalGroupKeys,
    delay,
    staticPriority,
  }: {
    queueName: MessageQueue;
    scopes: QueueJobScope[];
    limiters?: (QueueJobLimiter | undefined)[];
    additionalGroupKeys?: string[];
    delay: number | undefined;
    staticPriority: number | undefined;
  }): Promise<FairJobOptions[]> {
    const callerDelayMs = delay ?? 0;
    const [fairJobOptions, pacedDelays] = await Promise.all([
      this.computeFairJobOptions({
        queueName,
        scopes,
        additionalGroupKeys,
        delay,
        staticPriority,
      }),
      staticPriority === URGENT_FAIR_PRIORITY
        ? undefined
        : this.computePacedDelays({
            queueName,
            scopes,
            limiters,
            callerDelayMs,
          }),
    ]);

    return fairJobOptions.map((jobOptions, jobIndex) => {
      const pacedDelayMs = pacedDelays?.[jobIndex] ?? 0;

      return pacedDelayMs > callerDelayMs
        ? { ...jobOptions, delay: pacedDelayMs }
        : jobOptions;
    });
  }

  isGroupLimiterEnabled(): boolean {
    return this.options.isGroupLimiterEnabled();
  }

  private async computePacedDelays({
    queueName,
    scopes,
    limiters,
    callerDelayMs,
  }: {
    queueName: MessageQueue;
    scopes: QueueJobScope[];
    limiters: (QueueJobLimiter | undefined)[] | undefined;
    callerDelayMs: number;
  }): Promise<number[] | undefined> {
    if (!isDefined(limiters) || !this.options.isGroupLimiterEnabled()) {
      return undefined;
    }

    const requestBySlotKey = new Map<string, PacedJobsRequest>();

    scopes.forEach((scope, jobIndex) => {
      const limiter = limiters[jobIndex];
      const slotKey = isDefined(limiter)
        ? buildPaceSlotKey({ scope, limiter })
        : undefined;

      if (!isDefined(limiter) || !isDefined(slotKey)) {
        return;
      }

      const request = requestBySlotKey.get(slotKey) ?? {
        slotKey,
        limiter,
        jobIndexes: [],
      };

      request.jobIndexes.push(jobIndex);
      requestBySlotKey.set(slotKey, request);
    });

    const requests = [...requestBySlotKey.values()];

    if (requests.length === 0) {
      return undefined;
    }

    const delaysByRequest = await this.groupRatePacer.computeDelays({
      queueName,
      notBeforeDelayMs: callerDelayMs,
      requests: requests.map(({ slotKey, limiter, jobIndexes }) => ({
        limiters: [
          {
            groupKey: slotKey,
            limiter: { max: limiter.max, durationMs: limiter.durationMs },
          },
        ],
        jobCount: jobIndexes.length,
      })),
    });

    if (!isDefined(delaysByRequest)) {
      return undefined;
    }

    const pacedDelays = new Array<number>(scopes.length).fill(0);

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

  private async computeFairJobOptions({
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
