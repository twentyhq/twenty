import { PRIORITY_LIMIT, type RedisClient } from 'bullmq';
import { isDefined } from 'twenty-shared/utils';

import {
  FAIR_TICKET_OFFSET,
  URGENT_FAIR_PRIORITY,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { JOB_GROUP_WEIGHT_RANGE } from 'src/engine/core-modules/message-queue/constants/job-group-weight-range.constant';
import {
  type FairTicketLane,
  FairTicketAllocator,
} from 'src/engine/core-modules/message-queue/drivers/fairness/fair-ticket-allocator';
import {
  type GroupMaxRate,
  GroupRatePacer,
} from 'src/engine/core-modules/message-queue/drivers/fairness/group-rate-pacer';
import {
  type QueueJobGroup,
  type QueueJobScope,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueGroupConfig } from 'src/engine/core-modules/message-queue/types/message-queue-group-config.type';
import { buildJobGroupKey } from 'src/engine/core-modules/message-queue/utils/build-job-group-key.util';
import { buildQueueJobGroupKeys } from 'src/engine/core-modules/message-queue/utils/build-queue-job-group-keys.util';
import { buildWorkspaceGroupKey } from 'src/engine/core-modules/message-queue/utils/build-workspace-group-key.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type FairJobOptions = {
  priority?: number;
  fairBase?: number;
  delay?: number;
};

type GroupKeysRequest = {
  groupKeys: string[];
  jobIndexes: number[];
  workspaceGroupKey?: string;
  lane?: FairTicketLane;
  maxRates: GroupMaxRate[];
};

type GroupConfigByKind = Partial<
  Record<string, Pick<MessageQueueGroupConfig, 'maxRate'>>
>;

const getGroupKeyKind = (groupKey: string): string => groupKey.split(':')[0];

const clampJobGroupWeight = (weight: number | undefined): number =>
  Math.min(
    JOB_GROUP_WEIGHT_RANGE.max,
    Math.max(JOB_GROUP_WEIGHT_RANGE.min, weight ?? 1),
  );

type FairQueueSchedulerOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  getJobKey: (job: { queueName: MessageQueue; jobId: string }) => string;
  keyPrefix: string;
  getGroupConfig: (queueName: MessageQueue) => GroupConfigByKind | undefined;
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
    scopes,
    additionalGroupKeys,
    jobGroup,
    delay,
    staticPriority,
  }: {
    queueName: MessageQueue;
    scopes: QueueJobScope[];
    additionalGroupKeys?: string[];
    jobGroup?: QueueJobGroup;
    delay: number | undefined;
    staticPriority: number | undefined;
  }): Promise<FairJobOptions[]> {
    const requests = this.groupJobsByGroupKeys({
      scopes,
      additionalGroupKeys,
      jobGroup,
      groupConfig: this.options.getGroupConfig(queueName),
    });
    const callerDelayMs = delay ?? 0;
    const [fairJobOptions, pacedDelays] = await Promise.all([
      this.computeFairJobOptions({
        queueName,
        jobCount: scopes.length,
        requests,
        callerDelayMs,
        staticPriority,
      }),
      staticPriority === URGENT_FAIR_PRIORITY
        ? undefined
        : this.computePacedDelays({
            queueName,
            jobCount: scopes.length,
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
    scopes,
    additionalGroupKeys,
    jobGroup,
    groupConfig,
  }: {
    scopes: QueueJobScope[];
    additionalGroupKeys: string[] | undefined;
    jobGroup: QueueJobGroup | undefined;
    groupConfig: GroupConfigByKind | undefined;
  }): GroupKeysRequest[] {
    const requestByGroupKeys = new Map<string, GroupKeysRequest>();

    scopes.forEach((scope, jobIndex) => {
      const groupKeys = buildQueueJobGroupKeys({ scope, additionalGroupKeys });
      const workspaceGroupKey = isDefined(scope.workspaceId)
        ? buildWorkspaceGroupKey(scope.workspaceId)
        : undefined;
      const workspaceJobGroup = isDefined(scope.workspaceId)
        ? jobGroup
        : undefined;
      const signature = JSON.stringify([groupKeys, scope.workspaceId]);
      const request = requestByGroupKeys.get(signature) ?? {
        groupKeys,
        jobIndexes: [],
        workspaceGroupKey,
        lane: isDefined(workspaceJobGroup)
          ? {
              name: workspaceJobGroup.id,
              weight: clampJobGroupWeight(workspaceJobGroup.weight),
            }
          : undefined,
        maxRates: [
          ...groupKeys.flatMap((groupKey): GroupMaxRate[] => {
            const maxRate = groupConfig?.[getGroupKeyKind(groupKey)]?.maxRate;

            return isDefined(maxRate) ? [{ groupKey, maxRate }] : [];
          }),
          ...(isDefined(scope.workspaceId) &&
          isDefined(workspaceJobGroup?.maxRate)
            ? [
                {
                  groupKey: buildJobGroupKey({
                    workspaceId: scope.workspaceId,
                    jobGroupId: workspaceJobGroup.id,
                  }),
                  maxRate: workspaceJobGroup.maxRate,
                },
              ]
            : []),
        ],
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

    if (callerDelayMs > 0) {
      return staticJobOptions;
    }

    const fairTickets = await this.fairTicketAllocator.allocateTickets({
      queueName,
      requests: requests.map(
        ({ groupKeys, jobIndexes, workspaceGroupKey, lane }) => ({
          groupKeys,
          jobCount: jobIndexes.length,
          workspaceGroupKey,
          lane,
        }),
      ),
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
    if (!this.isGroupMaxRateEnabled()) {
      return undefined;
    }

    const delaysByRequest = await this.groupRatePacer.computeDelays({
      queueName,
      requests: requests.map(({ maxRates, jobIndexes }) => ({
        maxRates,
        jobCount: jobIndexes.length,
      })),
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
    void this.fairTicketAllocator.recordDispatch({ queueName, jobId });
  }

  isGroupMaxRateEnabled(): boolean {
    return this.options.twentyConfigService.get(
      'IS_WORKER_GROUP_MAX_RATE_ENABLED',
    );
  }
}
