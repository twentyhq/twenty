import { Logger } from '@nestjs/common';

import { createHash } from 'node:crypto';
import { basename, dirname, join } from 'path';

import { UnrecoverableError } from 'bullmq';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';
import { type QueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

import {
  JOB_PAYLOAD_RECONCILE_BATCH_SIZE,
  JOB_PAYLOAD_RECONCILE_SUSPECTS_TTL_SECONDS,
} from 'src/engine/core-modules/message-queue/constants/job-payload-offload.constant';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { buildJobPayloadStoragePath } from 'src/engine/core-modules/message-queue/drivers/payload/build-job-payload-storage-path.util';
import { isOffloadedJobPayload } from 'src/engine/core-modules/message-queue/drivers/payload/is-offloaded-job-payload.util';
import { JOB_PAYLOAD_RECONCILE_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/payload/job-payload-reconcile-script.constant';
import { OFFLOADED_JOB_PAYLOAD_KEY } from 'src/engine/core-modules/message-queue/drivers/payload/offloaded-job-payload-key.constant';
import { type OffloadedJobPayload } from 'src/engine/core-modules/message-queue/drivers/payload/offloaded-job-payload.type';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  type RedisScriptClient,
  runRedisScript,
} from 'src/engine/core-modules/message-queue/utils/run-redis-script.util';
import { scanRedisHashEntries } from 'src/engine/core-modules/message-queue/utils/scan-redis-hash-entries.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

export type JobPayloadReconciliation = {
  deletedCount: number;
};

type JobPayloadOffloaderOptions = {
  getClient: (queueName: MessageQueue) => Promise<RedisScriptClient>;
  getJobKey: (job: { queueName: MessageQueue; jobId: string }) => string;
  getStorageDriver?: () => StorageDriver;
  keyPrefix: string;
  metricsService: MetricsService;
  twentyConfigService: TwentyConfigService;
};

type JobPayloadLoadFailureReason = 'missing' | 'corrupted' | 'read';

const PAYLOAD_MIME_TYPE = 'application/json';

const computeSha256 = (content: Buffer): string =>
  createHash('sha256').update(content).digest('hex');

const formatError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export class JobPayloadOffloader {
  private readonly logger = new Logger(JobPayloadOffloader.name);

  constructor(private readonly options: JobPayloadOffloaderOptions) {}

  isEnabled(): boolean {
    return (
      isDefined(this.options.getStorageDriver) &&
      this.options.twentyConfigService.get(
        'IS_JOB_QUEUE_PAYLOAD_OFFLOAD_ENABLED',
      )
    );
  }

  shouldOffload(dataSizeBytes: number): boolean {
    return (
      this.isEnabled() &&
      dataSizeBytes >
        this.options.twentyConfigService.get(
          'JOB_QUEUE_PAYLOAD_OFFLOAD_THRESHOLD_BYTES',
        )
    );
  }

  getMaxOffloadedSizeBytes(): number {
    return this.options.twentyConfigService.get(
      'JOB_QUEUE_MAX_OFFLOADED_JOB_SIZE_BYTES',
    );
  }

  // returns undefined when the write fails, so the caller can keep the payload inline
  async offload({
    queueName,
    jobName,
    jobId,
    scope,
    serializedData,
  }: {
    queueName: MessageQueue;
    jobName: string;
    jobId: string;
    scope: QueueJobScope;
    serializedData: string;
  }): Promise<OffloadedJobPayload | undefined> {
    const path = buildJobPayloadStoragePath({
      scope,
      queueName,
      payloadId: v4(),
    });

    try {
      const offloadedPayload = await this.store({
        queueName,
        jobId,
        path,
        serializedData,
      });

      const { sizeBytes } = offloadedPayload[OFFLOADED_JOB_PAYLOAD_KEY];

      this.logger.log(
        `Offloaded the ${sizeBytes} bytes payload of job ${jobId} (${jobName}) on queue ${queueName} to ${path}`,
      );
      this.options.metricsService.incrementCounterBy({
        key: MetricsKeys.JobPayloadOffloaded,
        amount: 1,
        attributes: { queue: queueName, job_name: jobName },
      });
      this.options.metricsService.incrementCounterBy({
        key: MetricsKeys.JobPayloadOffloadedBytes,
        amount: sizeBytes,
        attributes: { queue: queueName, job_name: jobName },
      });

      return offloadedPayload;
    } catch (error) {
      this.logger.warn(
        `Failed to offload the payload of job ${jobId} (${jobName}) on queue ${queueName}, keeping it in Redis: ${formatError(error)}`,
      );
      this.options.metricsService.incrementCounterBy({
        key: MetricsKeys.JobPayloadOffloadFailed,
        amount: 1,
        attributes: { queue: queueName, job_name: jobName },
      });

      await this.deletePayload({ queueName, path });

      return undefined;
    }
  }

  async load<TData>({
    queueName,
    jobName,
    jobId,
    data,
  }: {
    queueName: MessageQueue;
    jobName: string;
    jobId: string | undefined;
    data: TData | OffloadedJobPayload;
  }): Promise<TData> {
    if (!isOffloadedJobPayload(data)) {
      return data;
    }

    const { path, sha256 } = data[OFFLOADED_JOB_PAYLOAD_KEY];
    let content: Buffer;

    try {
      content = await streamToBuffer(
        await this.getStorageDriverOrThrow().readFile({ filePath: path }),
      );
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        throw this.reportLoadFailure({
          queueName,
          jobName,
          reason: 'missing',
          message: `Payload of job ${jobId} on queue ${queueName} is missing from file storage at ${path}`,
        });
      }

      this.reportLoadFailure({
        queueName,
        jobName,
        reason: 'read',
        message: `Failed to read the payload of job ${jobId} on queue ${queueName} from ${path}: ${formatError(error)}`,
      });

      throw error;
    }

    if (computeSha256(content) !== sha256) {
      throw this.reportLoadFailure({
        queueName,
        jobName,
        reason: 'corrupted',
        message: `Payload of job ${jobId} on queue ${queueName} at ${path} does not match its checksum`,
      });
    }

    return JSON.parse(content.toString('utf8')) as TData;
  }

  // writes a new file instead of overwriting, so a failed update leaves the current reference valid
  async replace({
    queueName,
    jobId,
    offloadedPayload,
    data,
  }: {
    queueName: MessageQueue;
    jobId: string;
    offloadedPayload: OffloadedJobPayload;
    data: unknown;
  }): Promise<OffloadedJobPayload> {
    return this.store({
      queueName,
      jobId,
      path: join(
        dirname(offloadedPayload[OFFLOADED_JOB_PAYLOAD_KEY].path),
        `${v4()}.json`,
      ),
      serializedData: JSON.stringify(data) ?? '',
    });
  }

  async delete({
    queueName,
    data,
  }: {
    queueName: MessageQueue;
    data: unknown;
  }): Promise<void> {
    if (!isOffloadedJobPayload(data)) {
      return;
    }

    await this.deletePayload({
      queueName,
      path: data[OFFLOADED_JOB_PAYLOAD_KEY].path,
    });
  }

  async reconcile(queueName: MessageQueue): Promise<JobPayloadReconciliation> {
    const client = await this.options.getClient(queueName);
    const [refsKey, previousSuspectsKey] = this.buildKeys();
    const nextSuspectsKey = `${previousSuspectsKey}:next`;
    let deletedCount = 0;

    for await (const entries of scanRedisHashEntries({
      client,
      key: refsKey,
      batchSize: JOB_PAYLOAD_RECONCILE_BATCH_SIZE,
    })) {
      const orphanedPaths = (await runRedisScript({
        client,
        script: JOB_PAYLOAD_RECONCILE_SCRIPT,
        keys: [
          refsKey,
          previousSuspectsKey,
          nextSuspectsKey,
          ...entries.map(({ value }) => this.buildJobKeyOfMember(value)),
        ],
        args: [
          JOB_PAYLOAD_RECONCILE_SUSPECTS_TTL_SECONDS,
          ...entries.map(({ field }) => field),
        ],
      })) as string[];

      for (const path of orphanedPaths) {
        if (await this.deletePayload({ queueName, path })) {
          deletedCount++;
        }
      }
    }

    await client.runCommand('del', [previousSuspectsKey]);

    if (Number(await client.runCommand('exists', [nextSuspectsKey])) === 1) {
      await client.runCommand('rename', [nextSuspectsKey, previousSuspectsKey]);
    }

    return { deletedCount };
  }

  private async store({
    queueName,
    jobId,
    path,
    serializedData,
  }: {
    queueName: MessageQueue;
    jobId: string;
    path: string;
    serializedData: string;
  }): Promise<OffloadedJobPayload> {
    const content = Buffer.from(serializedData, 'utf8');
    const client = await this.options.getClient(queueName);
    const [refsKey] = this.buildKeys();

    // the reference goes first so the reconcile command sees a file left by a crash mid-write
    await client.runCommand('hset', [refsKey, path, `${queueName}:${jobId}`]);

    await this.getStorageDriverOrThrow().writeFile({
      filePath: path,
      sourceFile: content,
      mimeType: PAYLOAD_MIME_TYPE,
    });

    return {
      [OFFLOADED_JOB_PAYLOAD_KEY]: {
        path,
        sizeBytes: content.byteLength,
        sha256: computeSha256(content),
      },
    };
  }

  // the reference is kept when the file delete fails, so the reconcile command retries it
  private async deletePayload({
    queueName,
    path,
  }: {
    queueName: MessageQueue;
    path: string;
  }): Promise<boolean> {
    try {
      await this.getStorageDriverOrThrow().delete({
        folderPath: dirname(path),
        filename: basename(path),
      });

      const client = await this.options.getClient(queueName);
      const [refsKey] = this.buildKeys();

      await client.runCommand('hdel', [refsKey, path]);

      return true;
    } catch (error) {
      this.logger.warn(
        `Failed to delete the job payload at ${path} on queue ${queueName}: ${formatError(error)}`,
      );

      return false;
    }
  }

  private reportLoadFailure({
    queueName,
    jobName,
    reason,
    message,
  }: {
    queueName: MessageQueue;
    jobName: string;
    reason: JobPayloadLoadFailureReason;
    message: string;
  }): UnrecoverableError {
    this.logger.error(message);
    this.options.metricsService.incrementCounterBy({
      key: MetricsKeys.JobPayloadLoadFailed,
      amount: 1,
      attributes: { queue: queueName, job_name: jobName, reason },
    });

    return new UnrecoverableError(message);
  }

  private getStorageDriverOrThrow(): StorageDriver {
    if (!isDefined(this.options.getStorageDriver)) {
      throw new Error('No file storage is available for job payloads');
    }

    return this.options.getStorageDriver();
  }

  private buildKeys(): [string, string] {
    return [
      `${this.options.keyPrefix}:jobpayload:refs`,
      `${this.options.keyPrefix}:jobpayload:suspects`,
    ];
  }

  private buildJobKeyOfMember(member: string): string {
    const separatorIndex = member.indexOf(':');

    return this.options.getJobKey({
      queueName: member.slice(0, separatorIndex) as MessageQueue,
      jobId: member.slice(separatorIndex + 1),
    });
  }
}
