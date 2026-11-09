import { Logger } from '@nestjs/common';

import { type RedisClient } from 'bullmq';

import { GROUP_RATE_PACE_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/fairness/group-rate-pace-script.constant';
import { runRedisScript } from 'src/engine/core-modules/message-queue/utils/run-redis-script.util';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueGroupMaxRate } from 'src/engine/core-modules/message-queue/types/message-queue-group-max-rate.type';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

export type GroupMaxRate = {
  groupKey: string;
  maxRate: MessageQueueGroupMaxRate;
};

export type GroupRatePaceRequest = {
  maxRates: GroupMaxRate[];
  jobCount: number;
};

type GroupRatePacerOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisClient>;
  keyPrefix: string;
  metricsService: MetricsService;
};

type PacedGroupKey = {
  groupKey: string;
  intervalMs: number;
  toleranceMs: number;
};

export class GroupRatePacer {
  private readonly logger = new Logger(GroupRatePacer.name);

  constructor(private readonly options: GroupRatePacerOptions) {}

  async computeDelays({
    queueName,
    requests,
  }: {
    queueName: MessageQueue;
    requests: GroupRatePaceRequest[];
  }): Promise<number[][] | undefined> {
    const pacedKeysByRequest = requests.map(({ maxRates }) =>
      maxRates.flatMap(({ groupKey, maxRate }): PacedGroupKey[] => {
        if (maxRate.max <= 0) {
          return [];
        }

        const intervalMs = maxRate.durationMs / maxRate.max;
        const burst = maxRate.burst ?? maxRate.max;

        return [
          {
            groupKey,
            intervalMs,
            toleranceMs: Math.max(0, burst - 1) * intervalMs,
          },
        ];
      }),
    );
    const distinctPacedKeys = [
      ...new Map(
        pacedKeysByRequest
          .flat()
          .map((pacedKey) => [pacedKey.groupKey, pacedKey]),
      ).values(),
    ];

    if (distinctPacedKeys.length === 0) {
      return undefined;
    }

    const pacedKeyIndexes = new Map(
      distinctPacedKeys.map(({ groupKey }, index) => [groupKey, index + 1]),
    );
    const slotKeyPrefix = `${this.options.keyPrefix}:${queueName}:fair:slot:`;

    try {
      const rawEarliestDueTimes = await runRedisScript({
        client: await this.options.getClient(queueName),
        script: GROUP_RATE_PACE_SCRIPT,
        keys: distinctPacedKeys.map(
          ({ groupKey }) => `${slotKeyPrefix}${groupKey}`,
        ),
        args: [
          distinctPacedKeys.length,
          ...distinctPacedKeys.flatMap(({ intervalMs, toleranceMs }) => [
            intervalMs,
            toleranceMs,
          ]),
          requests.length,
          ...requests.flatMap(({ jobCount }, requestIndex) => [
            jobCount,
            pacedKeysByRequest[requestIndex].length,
            ...pacedKeysByRequest[requestIndex].map(
              ({ groupKey }) => pacedKeyIndexes.get(groupKey) ?? 0,
            ),
          ]),
        ],
      });

      const [nowMs, ...earliestDueTimes] = String(rawEarliestDueTimes)
        .split(' ')
        .map(Number);
      const expectedCount = pacedKeysByRequest.flat().length;

      if (
        earliestDueTimes.length !== expectedCount ||
        ![nowMs, ...earliestDueTimes].every(Number.isFinite)
      ) {
        throw new Error(
          `unexpected due times "${String(rawEarliestDueTimes)}"`,
        );
      }

      return requests.map(({ jobCount }, requestIndex) => {
        const firstDueTimeIndex = pacedKeysByRequest
          .slice(0, requestIndex)
          .reduce((count, pacedKeys) => count + pacedKeys.length, 0);
        const pacedKeys = pacedKeysByRequest[requestIndex].map(
          ({ intervalMs }, pacedKeyIndex) => ({
            earliestDueTime:
              earliestDueTimes[firstDueTimeIndex + pacedKeyIndex],
            intervalMs,
          }),
        );

        return Array.from({ length: jobCount }, (_, jobIndex) =>
          Math.max(
            0,
            ...pacedKeys.map(({ earliestDueTime, intervalMs }) =>
              Math.ceil(earliestDueTime + jobIndex * intervalMs - nowMs),
            ),
          ),
        );
      });
    } catch (error) {
      this.logger.warn(
        `Failed to pace the group keys on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
      );
      void this.options.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobGroupRateLimitFallback,
        attributes: { queue: queueName },
        shouldStoreInCache: false,
      });

      return undefined;
    }
  }
}
