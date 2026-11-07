import { Logger } from '@nestjs/common';

import {
  buildPayload,
  createMemoryHarness,
  MEMORY_SCENARIO_QUEUE,
  type MemoryHarnessOptions,
  silenceDriverLogs,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/memory-harness.test-util';
import { OFFLOADED_JOB_PAYLOAD_KEY } from 'src/engine/core-modules/message-queue/drivers/payload/offloaded-job-payload-key.constant';
import { type OffloadedJobPayload } from 'src/engine/core-modules/message-queue/drivers/payload/offloaded-job-payload.type';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const THRESHOLD_BYTES = 1_000;
const LARGE_PAYLOAD_BYTES = 5_000;

const createOffloadHarness = (options: MemoryHarnessOptions = {}) =>
  createMemoryHarness({
    payloadOffloadThresholdBytes: THRESHOLD_BYTES,
    workspaceShare: 1,
    applicationShare: 1,
    ...options,
  });

const enqueueOne = async ({
  harness,
  payloadBytes,
  workspaceId = 'A',
}: {
  harness: Awaited<ReturnType<typeof createOffloadHarness>>;
  payloadBytes: number;
  workspaceId?: string;
}) => {
  const {
    jobs: [job],
  } = await harness.enqueueBulk(
    [harness.buildApplicationJob({ label: 'job', workspaceId, payloadBytes })],
    { retryLimit: 1 },
  );

  return job;
};

const readReference = (data: unknown) =>
  (data as OffloadedJobPayload)[OFFLOADED_JOB_PAYLOAD_KEY];

describe('BullMQDriver job payload offload', () => {
  beforeAll(() => {
    silenceDriverLogs();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('keeps a job under the threshold inline', async () => {
    const harness = await createOffloadHarness();

    const { jobId } = await enqueueOne({ harness, payloadBytes: 100 });

    expect(harness.storedJob(jobId)?.data.payload).toBe(buildPayload(100));
    expect(harness.storedFiles.size).toBe(0);
  });

  it('keeps every job inline when offload is disabled', async () => {
    const harness = await createMemoryHarness({ workspaceShare: 1 });

    const { jobId } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });

    expect(harness.storedJob(jobId)?.data.payload).toHaveLength(
      LARGE_PAYLOAD_BYTES,
    );
  });

  it('stores a large payload under its workspace and charges only the reference', async () => {
    const harness = await createOffloadHarness();

    const { jobId, sizeBytes } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });
    const reference = readReference(harness.storedJob(jobId)?.data);

    expect(reference.path).toMatch(
      new RegExp(`^A/job-payloads/${MEMORY_SCENARIO_QUEUE}/[0-9a-f-]+\\.json$`),
    );
    expect(reference.sizeBytes).toBeGreaterThan(LARGE_PAYLOAD_BYTES);
    expect(harness.storedFiles.has(reference.path)).toBe(true);
    expect(await harness.readPayloadRefs()).toEqual({
      [reference.path]: `${MEMORY_SCENARIO_QUEUE}:${jobId}`,
    });
    expect(sizeBytes).toBeLessThan(LARGE_PAYLOAD_BYTES / 2);
    expect(await harness.readUsedBytes('workspace:A')).toBe(sizeBytes);
    expect(harness.metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.JobPayloadOffloadedBytes,
      amount: reference.sizeBytes,
      attributes: {
        queue: MEMORY_SCENARIO_QUEUE,
        job_name: expect.any(String),
      },
    });
  });

  it('stores a system job payload under the system folder', async () => {
    const harness = await createOffloadHarness();

    await harness.driver.bulkAdd(MEMORY_SCENARIO_QUEUE, 'system-job', [
      {
        data: { payload: buildPayload(LARGE_PAYLOAD_BYTES) },
        isSystemJob: true,
      },
    ]);

    expect([...harness.storedFiles.keys()]).toEqual([
      expect.stringMatching(/^system\/job-payloads\//),
    ]);
  });

  it('hands the full payload to the handler and deletes it once the job completes', async () => {
    const harness = await createOffloadHarness();
    const { jobId } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });
    const handler = jest.fn(async () => undefined);

    await harness.processJobOrThrow({ jobId, handler });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          payload: buildPayload(LARGE_PAYLOAD_BYTES),
        }),
      }),
    );
    expect(harness.storedFiles.size).toBe(0);
    expect(await harness.readPayloadRefs()).toEqual({});
  });

  it('keeps the payload for a retry and deletes it after the final failure', async () => {
    const harness = await createOffloadHarness();
    const { jobId } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });
    const failingHandler = async () => {
      throw new Error('boom');
    };

    await harness.processJobOrThrow({ jobId, handler: failingHandler });

    expect(harness.storedFiles.size).toBe(1);

    await harness.processJobOrThrow({ jobId, handler: failingHandler });

    expect(harness.storedFiles.size).toBe(0);
    expect(await harness.readPayloadRefs()).toEqual({});
  });

  it('fails the job without retry when its payload is missing', async () => {
    const harness = await createOffloadHarness();
    const { jobId } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });
    const handler = jest.fn(async () => undefined);

    harness.storedFiles.clear();
    await harness.processJobOrThrow({ jobId, handler });

    expect(handler).not.toHaveBeenCalled();
    expect(harness.storedJob(jobId)?.finishedOn).toBeDefined();
    expect(harness.storedJob(jobId)?.attemptsMade).toBe(1);
    expect(harness.metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.JobPayloadLoadFailed,
      amount: 1,
      attributes: {
        queue: MEMORY_SCENARIO_QUEUE,
        job_name: expect.any(String),
        reason: 'missing',
      },
    });
  });

  it('fails the job without retry when its payload does not match the checksum', async () => {
    const harness = await createOffloadHarness();
    const { jobId } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });
    const { path } = readReference(harness.storedJob(jobId)?.data);
    const processor = jest.fn(async () => undefined);

    harness.storedFiles.set(path, Buffer.from('{"payload":"tampered"}'));
    await harness.processJobOrThrow({ jobId, handler: processor });

    expect(processor).not.toHaveBeenCalled();
    expect(harness.storedJob(jobId)?.finishedOn).toBeDefined();
  });

  it('writes updated data to a new file and keeps only the reference in Redis', async () => {
    const harness = await createOffloadHarness();
    const { jobId } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });
    const { path: initialPath } = readReference(harness.storedJob(jobId)?.data);

    await harness.processJobOrThrow({
      jobId,
      handler: async (job) => {
        await job.updateData({ ...job.data, label: 'retried' });
        throw new Error('boom');
      },
    });

    const { path: updatedPath } = readReference(harness.storedJob(jobId)?.data);
    const receivedLabels: string[] = [];

    expect(updatedPath).not.toBe(initialPath);
    expect([...harness.storedFiles.keys()]).toEqual([updatedPath]);

    await harness.processJobOrThrow({
      jobId,
      handler: async (job) => {
        receivedLabels.push(job.data.label);
      },
    });

    expect(receivedLabels).toEqual(['retried']);
    expect(harness.storedFiles.size).toBe(0);
  });

  it('refuses a payload above the offloaded cap before writing it', async () => {
    const harness = await createOffloadHarness({
      maxOffloadedJobSizeBytes: 2_000,
    });

    const error = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(MessageQueueException);
    expect((error as MessageQueueException).code).toBe(
      MessageQueueExceptionCode.JOB_TOO_LARGE,
    );
    expect(harness.storedFiles.size).toBe(0);
    expect(
      harness.metricsService.incrementCounterForEvent,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        key: MetricsKeys.JobMemoryLimitRefused,
        attributes: expect.objectContaining({ reason: 'size' }),
      }),
    );
  });

  it('deletes the written payloads when the memory limit refuses the batch', async () => {
    const harness = await createOffloadHarness({ workspaceShare: 0.001 });

    const error = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    }).catch((caught: unknown) => caught);

    expect((error as MessageQueueException).code).toBe(
      MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
    );
    expect(harness.storedFiles.size).toBe(0);
    expect(await harness.readPayloadRefs()).toEqual({});
  });

  it('deletes the written payloads when BullMQ does not add the batch', async () => {
    const harness = await createOffloadHarness();

    harness.failNextAdd('not-added');

    await expect(
      enqueueOne({ harness, payloadBytes: LARGE_PAYLOAD_BYTES }),
    ).rejects.toThrow('connection lost');
    expect(harness.storedFiles.size).toBe(0);
  });

  it('keeps the payload when the enqueue outcome is unknown', async () => {
    const harness = await createOffloadHarness();

    harness.failNextAdd('unknown-outcome');

    await expect(
      enqueueOne({ harness, payloadBytes: LARGE_PAYLOAD_BYTES }),
    ).rejects.toThrow('connection lost');
    expect(harness.storedFiles.size).toBe(1);
  });

  it('keeps the payload inline when the storage write fails', async () => {
    const harness = await createOffloadHarness();

    harness.breakStorage();

    const { jobId } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });

    expect(harness.storedJob(jobId)?.data.payload).toHaveLength(
      LARGE_PAYLOAD_BYTES,
    );
    expect(harness.storedFiles.size).toBe(0);
    expect(harness.metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.JobPayloadOffloadFailed,
      amount: 1,
      attributes: {
        queue: MEMORY_SCENARIO_QUEUE,
        job_name: expect.any(String),
      },
    });
  });

  it('applies the inline size cap to a payload that falls back inline', async () => {
    const harness = await createOffloadHarness({ maxJobSizeBytes: 2_000 });

    harness.breakStorage();

    await expect(
      enqueueOne({ harness, payloadBytes: LARGE_PAYLOAD_BYTES }),
    ).rejects.toBeInstanceOf(MessageQueueException);
  });

  it('resolves offloaded payloads for in-flight job listings', async () => {
    const harness = await createOffloadHarness();
    const { jobId } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });

    const inFlightJobs = await harness.driver.getInFlightJobs<{
      payload: string;
    }>(MEMORY_SCENARIO_QUEUE);

    expect(inFlightJobs).toEqual([
      {
        id: jobId,
        data: expect.objectContaining({
          payload: buildPayload(LARGE_PAYLOAD_BYTES),
        }),
      },
    ]);
  });

  it('deletes the payload of a job removed outside the worker after two reconcile passes', async () => {
    const harness = await createOffloadHarness();
    const { jobId: removedJobId } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });
    const { jobId: liveJobId } = await enqueueOne({
      harness,
      payloadBytes: LARGE_PAYLOAD_BYTES,
    });
    const { path: livePath } = readReference(
      harness.storedJob(liveJobId)?.data,
    );

    await harness.removeFromBullMQ(removedJobId);

    expect(await harness.driver.reconcileJobPayloads()).toEqual({
      deletedCount: 0,
    });
    expect(harness.storedFiles.size).toBe(2);

    expect(await harness.driver.reconcileJobPayloads()).toEqual({
      deletedCount: 1,
    });
    expect([...harness.storedFiles.keys()]).toEqual([livePath]);
    expect(Object.keys(await harness.readPayloadRefs())).toEqual([livePath]);
  });
});
