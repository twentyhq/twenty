import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  JOB_MEMORY_CHARGE_TTL_SECONDS,
  JOB_MEMORY_INFO_CACHE_MS,
  JOB_MEMORY_UNCHARGED_GROUP_KEY,
} from 'src/engine/core-modules/message-queue/constants/job-memory-limit.constant';
import { JOB_QUEUE_MEMORY_LIMIT_MODE } from 'src/engine/core-modules/message-queue/constants/job-queue-memory-limit-mode.constant';
import { JOB_MEMORY_ADMIT_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-admit-script.constant';
import { JOB_MEMORY_RELEASE_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-release-script.constant';
import { JOB_MEMORY_RESIZE_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-resize-script.constant';
import { reportJobMemoryLimitRefusal } from 'src/engine/core-modules/message-queue/drivers/memory/report-job-memory-limit-refusal.util';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { type JobQueueMemoryLimitMode } from 'src/engine/core-modules/message-queue/types/job-queue-memory-limit-mode.type';
import { computeJobMemoryAvailableBytes } from 'src/engine/core-modules/message-queue/utils/compute-job-memory-available-bytes.util';
import { computeJobMemoryCapacityBytes } from 'src/engine/core-modules/message-queue/utils/compute-job-memory-capacity-bytes.util';
import {
  parseRedisMemoryInfo,
  type RedisMemoryInfo,
} from 'src/engine/core-modules/message-queue/utils/parse-redis-memory-info.util';
import {
  type RedisScriptClient,
  runRedisScript,
} from 'src/engine/core-modules/message-queue/utils/run-redis-script.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

export type JobMemoryRequest = {
  jobId: string;
  sizeBytes: number;
  groupKeys: string[];
};

export type JobMemoryAdmission = {
  isCharged: boolean;
  availableBytes: number | null;
};

export type ChargedJob = {
  queueName: MessageQueue;
  jobId: string;
  groupKeys: string[];
};

type JobMemoryLimiterOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisScriptClient>;
  keyPrefix: string;
  metricsService: MetricsService;
  getMode: () => JobQueueMemoryLimitMode;
  getShare: () => number;
  getReserve: () => number;
};

type MemorySnapshot = {
  info: RedisMemoryInfo | undefined;
  fetchedAt: number;
};

const NOT_CHARGED: JobMemoryAdmission = {
  isCharged: false,
  availableBytes: null,
};

export const getChargedGroupKeys = (groupKeys: string[]): string[] =>
  groupKeys.filter((groupKey) => groupKey !== JOB_MEMORY_UNCHARGED_GROUP_KEY);

export class JobMemoryLimiter {
  private readonly logger = new Logger(JobMemoryLimiter.name);
  private memorySnapshot: MemorySnapshot | undefined;

  constructor(private readonly options: JobMemoryLimiterOptions) {}

  isEnabled(): boolean {
    const mode = this.options.getMode();

    return (
      mode === JOB_QUEUE_MEMORY_LIMIT_MODE.OBSERVE ||
      mode === JOB_QUEUE_MEMORY_LIMIT_MODE.ENFORCE
    );
  }

  async admit({
    queueName,
    jobs,
  }: {
    queueName: MessageQueue;
    jobs: JobMemoryRequest[];
  }): Promise<JobMemoryAdmission> {
    const mode = this.options.getMode();

    if (
      mode !== JOB_QUEUE_MEMORY_LIMIT_MODE.OBSERVE &&
      mode !== JOB_QUEUE_MEMORY_LIMIT_MODE.ENFORCE
    ) {
      return NOT_CHARGED;
    }

    const chargedJobs = jobs
      .map((job) => ({ ...job, groupKeys: getChargedGroupKeys(job.groupKeys) }))
      .filter(({ groupKeys }) => groupKeys.length > 0);

    if (chargedJobs.length === 0) {
      return NOT_CHARGED;
    }

    const memoryInfo = await this.getMemoryInfo(queueName);

    if (!isDefined(memoryInfo) || memoryInfo.maxMemoryBytes <= 0) {
      return NOT_CHARGED;
    }

    const capacityBytes = computeJobMemoryCapacityBytes({
      maxMemoryBytes: memoryInfo.maxMemoryBytes,
      reserve: this.options.getReserve(),
    });
    const groupKeys = [
      ...new Set(chargedJobs.flatMap(({ groupKeys }) => groupKeys)),
    ];
    const groupKeyIndexes = new Map(
      groupKeys.map((groupKey, index) => [groupKey, index + 1]),
    );

    let admitResult: ReturnType<JobMemoryLimiter['parseAdmitResult']>;

    try {
      const rawResult = await runRedisScript({
        client: await this.options.getClient(queueName),
        script: JOB_MEMORY_ADMIT_SCRIPT,
        keys: groupKeys.flatMap((groupKey) => this.buildKeys(groupKey)),
        args: [
          mode === JOB_QUEUE_MEMORY_LIMIT_MODE.OBSERVE ? 1 : 0,
          capacityBytes,
          memoryInfo.usedMemoryBytes,
          this.options.getShare(),
          JOB_MEMORY_CHARGE_TTL_SECONDS,
          groupKeys.length,
          chargedJobs.length,
          ...chargedJobs.flatMap(({ jobId, sizeBytes, groupKeys }) => [
            this.buildMember({ queueName, jobId }),
            sizeBytes,
            groupKeys.length,
            ...groupKeys.map((groupKey) => groupKeyIndexes.get(groupKey) ?? 0),
          ]),
        ],
      });

      admitResult = this.parseAdmitResult({ rawResult, groupKeys });
    } catch (error) {
      this.logger.warn(
        `Failed to admit the job memory on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return NOT_CHARGED;
    }

    const { isRefused, groupKeyAdmissions } = admitResult;

    for (const admission of groupKeyAdmissions) {
      if (
        admission.requestedBytes > 0 &&
        admission.usedBytes + admission.requestedBytes > admission.limitBytes
      ) {
        reportJobMemoryLimitRefusal({
          logger: this.logger,
          metricsService: this.options.metricsService,
          refusal: {
            queueName,
            groupKey: admission.groupKey,
            reason: 'share',
            mode,
            requestedBytes: admission.requestedBytes,
            usedBytes: admission.usedBytes,
            limitBytes: admission.limitBytes,
          },
        });
      }
    }

    const availableBytes = computeJobMemoryAvailableBytes(
      groupKeyAdmissions.map(({ usedBytesAfter, limitBytes }) => ({
        usedBytes: usedBytesAfter,
        limitBytes,
      })),
    );

    if (isRefused && mode === JOB_QUEUE_MEMORY_LIMIT_MODE.ENFORCE) {
      const requestedBytes = chargedJobs.reduce(
        (total, { sizeBytes }) => total + sizeBytes,
        0,
      );

      throw new MessageQueueException(
        `Job memory limit reached on queue ${queueName}: ${requestedBytes} bytes requested, ${availableBytes ?? 0} bytes available`,
        MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
        { requestedBytes, availableBytes: availableBytes ?? 0 },
      );
    }

    return { isCharged: true, availableBytes };
  }

  async release({ queueName, jobId, groupKeys }: ChargedJob): Promise<void> {
    await this.runChargeScript({
      queueName,
      groupKeys,
      script: JOB_MEMORY_RELEASE_SCRIPT,
      args: [this.buildMember({ queueName, jobId })],
      action: `release the job memory of job ${jobId}`,
    });
  }

  async resize({
    queueName,
    jobId,
    groupKeys,
    sizeBytes,
  }: ChargedJob & { sizeBytes: number }): Promise<void> {
    await this.runChargeScript({
      queueName,
      groupKeys,
      script: JOB_MEMORY_RESIZE_SCRIPT,
      args: [
        this.buildMember({ queueName, jobId }),
        sizeBytes,
        JOB_MEMORY_CHARGE_TTL_SECONDS,
      ],
      action: `resize the job memory of job ${jobId}`,
    });
  }

  async getUsedRatio(queueName: MessageQueue): Promise<number | undefined> {
    const memoryInfo = await this.getMemoryInfo(queueName);

    if (!isDefined(memoryInfo) || memoryInfo.maxMemoryBytes <= 0) {
      return undefined;
    }

    const capacityBytes = computeJobMemoryCapacityBytes({
      maxMemoryBytes: memoryInfo.maxMemoryBytes,
      reserve: this.options.getReserve(),
    });

    return capacityBytes > 0
      ? memoryInfo.usedMemoryBytes / capacityBytes
      : undefined;
  }

  private async runChargeScript({
    queueName,
    groupKeys,
    script,
    args,
    action,
  }: {
    queueName: MessageQueue;
    groupKeys: string[];
    script: string;
    args: (string | number)[];
    action: string;
  }): Promise<void> {
    const chargedGroupKeys = getChargedGroupKeys(groupKeys);

    if (chargedGroupKeys.length === 0) {
      return;
    }

    try {
      await runRedisScript({
        client: await this.options.getClient(queueName),
        script,
        keys: chargedGroupKeys.flatMap((groupKey) => this.buildKeys(groupKey)),
        args,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to ${action} on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async getMemoryInfo(
    queueName: MessageQueue,
  ): Promise<RedisMemoryInfo | undefined> {
    const now = Date.now();

    if (
      isDefined(this.memorySnapshot) &&
      now - this.memorySnapshot.fetchedAt < JOB_MEMORY_INFO_CACHE_MS
    ) {
      return this.memorySnapshot.info;
    }

    let info: RedisMemoryInfo | undefined;

    try {
      const client = await this.options.getClient(queueName);

      info = parseRedisMemoryInfo(
        String(await client.runCommand('info', ['memory'])),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to read the Redis memory info: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    this.memorySnapshot = { info, fetchedAt: now };

    return info;
  }

  private parseAdmitResult({
    rawResult,
    groupKeys,
  }: {
    rawResult: unknown;
    groupKeys: string[];
  }) {
    const values = String(rawResult).split(' ').map(Number);

    if (
      values.length !== 1 + 4 * groupKeys.length ||
      !values.every(Number.isFinite)
    ) {
      throw new Error(`unexpected admission result "${String(rawResult)}"`);
    }

    return {
      isRefused: values[0] === 1,
      groupKeyAdmissions: groupKeys.map((groupKey, index) => ({
        groupKey,
        usedBytes: values[1 + 4 * index],
        limitBytes: values[2 + 4 * index],
        requestedBytes: values[3 + 4 * index],
        usedBytesAfter: values[4 + 4 * index],
      })),
    };
  }

  private buildKeys(groupKey: string): [string, string] {
    return [
      `${this.options.keyPrefix}:jobmem:used:${groupKey}`,
      `${this.options.keyPrefix}:jobmem:jobs:${groupKey}`,
    ];
  }

  private buildMember({
    queueName,
    jobId,
  }: {
    queueName: MessageQueue;
    jobId: string;
  }): string {
    return `${queueName}:${jobId}`;
  }
}
