import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  JOB_MEMORY_INFO_CACHE_MS,
  JOB_MEMORY_RECONCILE_BATCH_SIZE,
  JOB_MEMORY_RECONCILE_SUSPECTS_TTL_SECONDS,
} from 'src/engine/core-modules/message-queue/constants/job-memory-limit.constant';
import { JOB_MEMORY_ADMIT_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-admit-script.constant';
import { JOB_MEMORY_RECONCILE_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-reconcile-script.constant';
import { JOB_MEMORY_RELEASE_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-release-script.constant';
import { reportJobMemoryLimitRefusal } from 'src/engine/core-modules/message-queue/drivers/memory/report-job-memory-limit-refusal.util';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { buildApplicationGroupKey } from 'src/engine/core-modules/message-queue/utils/build-application-group-key.util';
import { buildWorkspaceGroupKey } from 'src/engine/core-modules/message-queue/utils/build-workspace-group-key.util';
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
import { scanRedisHashFields } from 'src/engine/core-modules/message-queue/utils/scan-redis-hash-fields.util';
import { scanRedisKeys } from 'src/engine/core-modules/message-queue/utils/scan-redis-keys.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type JobMemoryRequest = {
  jobId: string;
  sizeBytes: number;
  groupKeys: string[];
};

export type JobMemoryAdmission = {
  isCharged: boolean;
  availableBytes: number | null;
};

export type JobMemoryReconciliation = {
  releasedCount: number;
  releasedBytes: number;
};

export type ChargedJob = {
  queueName: MessageQueue;
  jobId: string;
  groupKeys: string[];
};

type JobMemoryLimiterOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisScriptClient>;
  getJobKey: (job: { queueName: MessageQueue; jobId: string }) => string;
  keyPrefix: string;
  metricsService: MetricsService;
  twentyConfigService: TwentyConfigService;
};

type MemorySnapshot = {
  info: RedisMemoryInfo | undefined;
  fetchedAt: number;
};

const NOT_CHARGED: JobMemoryAdmission = {
  isCharged: false,
  availableBytes: null,
};

const WORKSPACE_GROUP_KEY_PREFIX = buildWorkspaceGroupKey('');
const APPLICATION_GROUP_KEY_PREFIX = buildApplicationGroupKey('');

export const getChargedGroupKeys = (groupKeys: string[]): string[] =>
  groupKeys.filter(
    (groupKey) =>
      groupKey.startsWith(WORKSPACE_GROUP_KEY_PREFIX) ||
      groupKey.startsWith(APPLICATION_GROUP_KEY_PREFIX),
  );

export class JobMemoryLimiter {
  private readonly logger = new Logger(JobMemoryLimiter.name);
  private memorySnapshot: MemorySnapshot | undefined;

  constructor(private readonly options: JobMemoryLimiterOptions) {}

  isEnabled(): boolean {
    return this.options.twentyConfigService.get(
      'IS_REDIS_MEMORY_FAIRNESS_ENABLED',
    );
  }

  async admit({
    queueName,
    jobName,
    jobs,
  }: {
    queueName: MessageQueue;
    jobName: string;
    jobs: JobMemoryRequest[];
  }): Promise<JobMemoryAdmission> {
    if (!this.isEnabled()) {
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
      reserve: this.options.twentyConfigService.get('JOB_QUEUE_MEMORY_RESERVE'),
    });
    const groupKeys = [
      ...new Set(chargedJobs.flatMap(({ groupKeys }) => groupKeys)),
    ];
    const groupKeyIndexes = new Map(
      groupKeys.map((groupKey, index) => [groupKey, index + 1]),
    );

    const admitResult = await runRedisScript({
      client: await this.options.getClient(queueName),
      script: JOB_MEMORY_ADMIT_SCRIPT,
      keys: groupKeys.flatMap((groupKey) => this.buildKeys(groupKey)),
      args: [
        capacityBytes,
        memoryInfo.usedMemoryBytes,
        groupKeys.length,
        ...groupKeys.map((groupKey) => this.getShare(groupKey)),
        chargedJobs.length,
        ...chargedJobs.flatMap(({ jobId, sizeBytes, groupKeys }) => [
          this.buildMember({ queueName, jobId }),
          sizeBytes,
          groupKeys.length,
          ...groupKeys.map((groupKey) => groupKeyIndexes.get(groupKey) ?? 0),
        ]),
      ],
    })
      .then((rawResult) => this.parseAdmitResult({ rawResult, groupKeys }))
      .catch((error: unknown) => {
        this.logger.warn(
          `Failed to admit the job memory on queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
        );

        return undefined;
      });

    if (!isDefined(admitResult)) {
      return NOT_CHARGED;
    }

    const { isRefused, groupKeyAdmissions } = admitResult;
    const refusedAdmissions = groupKeyAdmissions.filter(
      (admission) =>
        admission.requestedBytes > 0 &&
        admission.usedBytes + admission.requestedBytes > admission.limitBytes,
    );

    for (const admission of refusedAdmissions) {
      reportJobMemoryLimitRefusal({
        logger: this.logger,
        metricsService: this.options.metricsService,
        refusal: {
          queueName,
          jobName,
          groupKey: admission.groupKey,
          reason: 'share',
          requestedBytes: admission.requestedBytes,
          usedBytes: admission.usedBytes,
          limitBytes: admission.limitBytes,
        },
      });
    }

    const availableBytes = computeJobMemoryAvailableBytes(
      groupKeyAdmissions.map(({ usedBytesAfter, limitBytes }) => ({
        usedBytes: usedBytesAfter,
        limitBytes,
      })),
    );

    if (isRefused) {
      const requestedBytes = chargedJobs.reduce(
        (total, { sizeBytes }) => total + sizeBytes,
        0,
      );

      const refusedGroupKeys = refusedAdmissions.map(
        ({ groupKey }) => groupKey,
      );

      throw new MessageQueueException(
        `Job memory limit reached on queue ${queueName} for ${refusedGroupKeys.join(', ')}: ${requestedBytes} bytes requested, ${availableBytes ?? 0} bytes available`,
        MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
        {
          requestedBytes,
          availableBytes: availableBytes ?? 0,
          refusedGroupKeys,
        },
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

  async reconcile(queueName: MessageQueue): Promise<JobMemoryReconciliation> {
    const client = await this.options.getClient(queueName);
    const jobsKeyPrefix = `${this.options.keyPrefix}:jobmem:jobs:`;
    const reconciliation: JobMemoryReconciliation = {
      releasedCount: 0,
      releasedBytes: 0,
    };

    const reconciledGroupKeys = new Set<string>();

    for await (const jobsKey of scanRedisKeys({
      client,
      pattern: `${jobsKeyPrefix}*`,
    })) {
      const groupKey = jobsKey.slice(jobsKeyPrefix.length);

      // SCAN can return a key twice, and a second pass in the same run would skip the grace period
      if (reconciledGroupKeys.has(groupKey)) {
        continue;
      }

      reconciledGroupKeys.add(groupKey);

      const { releasedCount, releasedBytes } = await this.reconcileGroupKey({
        client,
        groupKey,
      });

      reconciliation.releasedCount += releasedCount;
      reconciliation.releasedBytes += releasedBytes;
    }

    return reconciliation;
  }

  private async reconcileGroupKey({
    client,
    groupKey,
  }: {
    client: RedisScriptClient;
    groupKey: string;
  }): Promise<JobMemoryReconciliation> {
    const [usedKey, jobsKey] = this.buildKeys(groupKey);
    const previousSuspectsKey = `${this.options.keyPrefix}:jobmem:suspects:${groupKey}`;
    const nextSuspectsKey = `${previousSuspectsKey}:next`;
    const reconciliation: JobMemoryReconciliation = {
      releasedCount: 0,
      releasedBytes: 0,
    };

    for await (const members of scanRedisHashFields({
      client,
      key: jobsKey,
      batchSize: JOB_MEMORY_RECONCILE_BATCH_SIZE,
    })) {
      const [releasedCount, releasedBytes] = String(
        await runRedisScript({
          client,
          script: JOB_MEMORY_RECONCILE_SCRIPT,
          keys: [
            usedKey,
            jobsKey,
            previousSuspectsKey,
            nextSuspectsKey,
            ...members.map((member) => this.buildJobKeyOfMember(member)),
          ],
          args: [JOB_MEMORY_RECONCILE_SUSPECTS_TTL_SECONDS, ...members],
        }),
      )
        .split(' ')
        .map(Number);

      reconciliation.releasedCount += releasedCount;
      reconciliation.releasedBytes += releasedBytes;
    }

    await client.runCommand('del', [previousSuspectsKey]);

    if (Number(await client.runCommand('exists', [nextSuspectsKey])) === 1) {
      await client.runCommand('rename', [nextSuspectsKey, previousSuspectsKey]);
    }

    return reconciliation;
  }

  async getUsedRatio(queueName: MessageQueue): Promise<number | undefined> {
    const memoryInfo = await this.getMemoryInfo(queueName);

    if (!isDefined(memoryInfo) || memoryInfo.maxMemoryBytes <= 0) {
      return undefined;
    }

    const capacityBytes = computeJobMemoryCapacityBytes({
      maxMemoryBytes: memoryInfo.maxMemoryBytes,
      reserve: this.options.twentyConfigService.get('JOB_QUEUE_MEMORY_RESERVE'),
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

  private getShare(groupKey: string): number {
    if (groupKey.startsWith(APPLICATION_GROUP_KEY_PREFIX)) {
      return this.options.twentyConfigService.get(
        'JOB_QUEUE_MEMORY_SHARE_BY_APPLICATION_UNIVERSAL_IDENTIFIER',
      );
    }

    return this.options.twentyConfigService.get(
      'JOB_QUEUE_MEMORY_SHARE_BY_WORKSPACE_ID',
    );
  }

  private buildKeys(groupKey: string): [string, string] {
    return [
      `${this.options.keyPrefix}:jobmem:used:${groupKey}`,
      `${this.options.keyPrefix}:jobmem:jobs:${groupKey}`,
    ];
  }

  private buildJobKeyOfMember(member: string): string {
    const separatorIndex = member.indexOf(':');

    return this.options.getJobKey({
      queueName: member.slice(0, separatorIndex) as MessageQueue,
      jobId: member.slice(separatorIndex + 1),
    });
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
