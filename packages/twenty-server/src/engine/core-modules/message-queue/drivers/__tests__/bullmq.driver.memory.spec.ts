import { createHash } from 'node:crypto';

import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  createMemoryHarness,
  MEMORY_SCENARIO_JOB_NAME,
  MEMORY_SCENARIO_QUEUE,
  silenceDriverLogs,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/memory-harness.test-util';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { computeJobSizeBytes } from 'src/engine/core-modules/message-queue/utils/compute-job-size-bytes.util';

// Default harness: maxmemory 100_000 minus a 0.1 reserve, workspace share 0.1, application share 0.4
const CAPACITY_BYTES = 90_000;
const WORKSPACE_A = 'workspace:A';
const WORKSPACE_B = 'workspace:B';
const APPLICATION = 'application:app-1';

const sumSizes = (jobs: { sizeBytes: number }[]) =>
  jobs.reduce((total, { sizeBytes }) => total + sizeBytes, 0);

const expectMessageQueueException = async (
  promise: Promise<unknown>,
  code: MessageQueueExceptionCode,
) => {
  const error = await promise.catch((caught: unknown) => caught);

  expect(error).toBeInstanceOf(MessageQueueException);
  expect((error as MessageQueueException).code).toBe(code);
};

describe('BullMQDriver job memory scenarios', () => {
  beforeAll(silenceDriverLogs);

  describe('S1: workspace A enqueues app jobs of ~3KB until it reaches its share', () => {
    it('A is charged on its workspace and application keys and told how much memory is left', async () => {
      const harness = await createMemoryHarness();

      const { jobs, availableBytes } = await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'A1',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
        harness.buildApplicationJob({
          label: 'A2',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
      ]);
      const chargedBytes = sumSizes(jobs);

      expect(jobs).toHaveLength(2);
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(chargedBytes);
      expect(await harness.readUsedBytes(APPLICATION)).toBe(chargedBytes);
      expect(availableBytes).toBe(CAPACITY_BYTES * 0.1 - chargedBytes);
    });

    it('the job that would cross the share is refused, nothing of it is stored or charged', async () => {
      const harness = await createMemoryHarness();

      await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'A1',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
        harness.buildApplicationJob({
          label: 'A2',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
      ]);
      const usedBytesBefore = await harness.readUsedBytes(WORKSPACE_A);

      await expectMessageQueueException(
        harness.enqueueBulk([
          harness.buildApplicationJob({
            label: 'A3',
            workspaceId: 'A',
            payloadBytes: 2_000,
          }),
        ]),
        MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
      );

      expect(harness.storedJobIds()).toHaveLength(2);
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(usedBytesBefore);
      expect(await harness.readUsedBytes(APPLICATION)).toBe(usedBytesBefore);
      expect(
        harness.metricsService.incrementCounterForEvent,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.JobMemoryLimitRefused,
          attributes: {
            queue: MEMORY_SCENARIO_QUEUE,
            job_name: MEMORY_SCENARIO_JOB_NAME,
            reason: 'share',
          },
        }),
      );
    });
  });

  describe('S2: A bulk-enqueues 3 jobs of ~3KB, the third one crossing its share', () => {
    it('the whole batch is refused, none of its jobs is stored or charged', async () => {
      const harness = await createMemoryHarness();

      await expectMessageQueueException(
        harness.enqueueBulk(
          ['A1', 'A2', 'A3'].map((label) =>
            harness.buildApplicationJob({
              label,
              workspaceId: 'A',
              payloadBytes: 2_000,
            }),
          ),
        ),
        MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
      );

      expect(harness.storedJobIds()).toEqual([]);
      expect(await harness.readTotalChargedBytes()).toBe(0);
    });
  });

  describe('S3: A fills its share, then workspace B enqueues a job', () => {
    it('B is admitted with a share of what A leaves free', async () => {
      const harness = await createMemoryHarness();

      const { jobs: jobsOfA } = await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'A1',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
        harness.buildApplicationJob({
          label: 'A2',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
      ]);

      await expect(
        harness.enqueueBulk([
          harness.buildApplicationJob({
            label: 'A3',
            workspaceId: 'A',
            payloadBytes: 2_000,
          }),
        ]),
      ).rejects.toThrow(MessageQueueException);

      const {
        jobs: [jobOfB],
        availableBytes,
      } = await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'B1',
          workspaceId: 'B',
          payloadBytes: 2_000,
        }),
      ]);

      expect(await harness.readUsedBytes(WORKSPACE_B)).toBe(jobOfB.sizeBytes);
      expect(availableBytes).toBe(
        Math.floor(0.1 * (CAPACITY_BYTES - sumSizes(jobsOfA))) -
          jobOfB.sizeBytes,
      );
    });
  });

  describe('S4: workspaces W1 to W8 each enqueue a ~4.5KB job of application H, then W9 does the same', () => {
    const enqueueHerd = async (
      harness: Awaited<ReturnType<typeof createMemoryHarness>>,
    ) => {
      for (let index = 1; index <= 8; index++) {
        await harness.enqueueBulk([
          harness.buildApplicationJob({
            label: `W${index}`,
            workspaceId: `W${index}`,
            applicationUniversalIdentifier: 'H',
            payloadBytes: 3_200,
          }),
        ]);
      }
    };

    it('W9 is refused because H reached its 40% share, while W9 alone is far from its own share', async () => {
      const harness = await createMemoryHarness();

      await enqueueHerd(harness);

      await expectMessageQueueException(
        harness.enqueueBulk([
          harness.buildApplicationJob({
            label: 'W9',
            workspaceId: 'W9',
            applicationUniversalIdentifier: 'H',
            payloadBytes: 3_200,
          }),
        ]),
        MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
      );

      expect(jest.mocked(Logger.prototype.warn)).toHaveBeenLastCalledWith(
        expect.stringContaining(
          `for job ${MEMORY_SCENARIO_JOB_NAME} on queue ${MEMORY_SCENARIO_QUEUE} [key=application:H reason=share`,
        ),
      );
      expect(await harness.readUsedBytes('workspace:W9')).toBe(0);
      expect(await harness.readUsedBytes('application:H')).toBeLessThanOrEqual(
        CAPACITY_BYTES * 0.4,
      );
    });

    it('W9 can still enqueue a job of another application', async () => {
      const harness = await createMemoryHarness();

      await enqueueHerd(harness);

      const { jobs } = await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'W9',
          workspaceId: 'W9',
          applicationUniversalIdentifier: 'Q',
          payloadBytes: 3_200,
        }),
      ]);

      expect(await harness.readUsedBytes('application:Q')).toBe(
        jobs[0].sizeBytes,
      );
    });
  });

  describe('S5: Redis holds 50KB of other data, A enqueues app jobs', () => {
    it('the share applies to the memory left free, so A is refused sooner', async () => {
      const harness = await createMemoryHarness({ otherDataBytes: 50_000 });

      const {
        jobs: [jobOfA],
        availableBytes,
      } = await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'A1',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
      ]);

      expect(availableBytes).toBe(
        Math.floor(0.1 * (CAPACITY_BYTES - 50_000)) - jobOfA.sizeBytes,
      );
      await expect(
        harness.enqueueBulk([
          harness.buildApplicationJob({
            label: 'A2',
            workspaceId: 'A',
            payloadBytes: 2_000,
          }),
        ]),
      ).rejects.toThrow(MessageQueueException);
    });
  });

  describe('S6: A fills its share, then one of its jobs gets processed', () => {
    it('a completed job frees its charge, so A can enqueue again', async () => {
      const harness = await createMemoryHarness();

      const {
        jobs: [firstJob, secondJob],
      } = await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'A1',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
        harness.buildApplicationJob({
          label: 'A2',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
      ]);

      await harness.processJobOrThrow({ jobId: firstJob.jobId });

      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(
        secondJob.sizeBytes,
      );
      expect(await harness.readUsedBytes(APPLICATION)).toBe(
        secondJob.sizeBytes,
      );
      await expect(
        harness.enqueueBulk([
          harness.buildApplicationJob({
            label: 'A3',
            workspaceId: 'A',
            payloadBytes: 2_000,
          }),
        ]),
      ).resolves.toMatchObject({ jobs: [expect.anything()] });
    });

    it('a failed job keeps its charge while it has retries left, and frees it on its final failure', async () => {
      const harness = await createMemoryHarness();

      const {
        jobs: [job],
      } = await harness.enqueueBulk(
        [
          harness.buildApplicationJob({
            label: 'A1',
            workspaceId: 'A',
            payloadBytes: 2_000,
          }),
        ],
        { retryLimit: 1 },
      );
      const failingHandler = async () => {
        throw new Error('handler failed');
      };

      await harness.processJobOrThrow({
        jobId: job.jobId,
        handler: failingHandler,
      });

      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(job.sizeBytes);

      await harness.processJobOrThrow({
        jobId: job.jobId,
        handler: failingHandler,
      });

      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(0);
      expect(await harness.readChargedJobs(WORKSPACE_A)).toEqual({});
    });

    it('a job failing on an unrecoverable error frees its charge right away', async () => {
      const harness = await createMemoryHarness();

      const {
        jobs: [job],
      } = await harness.enqueueBulk(
        [
          harness.buildApplicationJob({
            label: 'A1',
            workspaceId: 'A',
            payloadBytes: 2_000,
          }),
        ],
        { retryLimit: 3 },
      );

      await harness.processJobOrThrow({
        jobId: job.jobId,
        handler: async () => {
          throw new MessageQueueException(
            'payload too large',
            MessageQueueExceptionCode.JOB_TOO_LARGE,
            { index: 0, sizeBytes: 2_000_000, maxBytes: 1_048_576 },
          );
        },
      });

      expect(harness.storedJob(job.jobId)?.finishedOn).toBeDefined();
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(0);
    });
  });

  describe('S7: A enqueues job ids that BullMQ already holds', () => {
    it('an id still waiting is skipped, it is neither added nor charged twice', async () => {
      const harness = await createMemoryHarness();
      const job = harness.buildApplicationJob({
        label: 'A1',
        workspaceId: 'A',
        payloadBytes: 2_000,
        jobId: 'same-id',
      });

      const { jobs } = await harness.enqueueBulk([job]);
      const second = await harness.enqueueBulk([job]);

      expect(second.jobs).toEqual([]);
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(jobs[0].sizeBytes);
    });

    it('an id BullMQ keeps after it finished is not charged again, as BullMQ starts no new run for it', async () => {
      const harness = await createMemoryHarness();
      const job = harness.buildApplicationJob({
        label: 'A1',
        workspaceId: 'A',
        payloadBytes: 2_000,
        jobId: 'finished-id',
      });

      await harness.enqueueBulk([job]);
      await harness.processJobOrThrow({ jobId: 'finished-id' });

      const { jobs } = await harness.enqueueBulk([
        job,
        harness.buildApplicationJob({
          label: 'A2',
          workspaceId: 'A',
          payloadBytes: 2_000,
          jobId: 'new-id',
        }),
      ]);

      expect(jobs.map(({ jobId }) => jobId)).toEqual(['finished-id', 'new-id']);
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(jobs[1].sizeBytes);
      expect(Object.keys(await harness.readChargedJobs(WORKSPACE_A))).toEqual([
        `${MEMORY_SCENARIO_QUEUE}:new-id`,
      ]);
    });

    it('a finished id removed from BullMQ is a new run and is charged again', async () => {
      const harness = await createMemoryHarness();
      const job = harness.buildApplicationJob({
        label: 'A1',
        workspaceId: 'A',
        payloadBytes: 2_000,
        jobId: 'removed-id',
      });

      await harness.enqueueBulk([job]);
      await harness.processJobOrThrow({ jobId: 'removed-id' });
      await harness.removeFromBullMQ('removed-id');

      const { jobs } = await harness.enqueueBulk([job]);

      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(jobs[0].sizeBytes);
    });
  });

  describe('S8: A enqueues two jobs with the same deduplication id', () => {
    it('the second job is merged into the first one by BullMQ and its charge is released', async () => {
      const harness = await createMemoryHarness();
      const options = {
        workspaceId: 'A',
        isWorkspaceJob: true as const,
        deduplication: { id: 'dedup-1' },
      };

      const firstJobId = await harness.enqueue({
        label: 'A1',
        payloadBytes: 2_000,
        options,
      });
      const usedBytesAfterFirst = await harness.readUsedBytes(WORKSPACE_A);
      const secondJobId = await harness.enqueue({
        label: 'A2',
        payloadBytes: 2_000,
        options,
      });

      expect(secondJobId).toBe(firstJobId);
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(
        usedBytesAfterFirst,
      );
      expect(Object.keys(await harness.readChargedJobs(WORKSPACE_A))).toEqual([
        `${MEMORY_SCENARIO_QUEUE}:${firstJobId}`,
      ]);
    });
  });

  describe('S9: the BullMQ add of a batch of A fails', () => {
    const enqueueBatch = (
      harness: Awaited<ReturnType<typeof createMemoryHarness>>,
    ) =>
      harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'A1',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
        harness.buildApplicationJob({
          label: 'A2',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
      ]);

    it('jobs BullMQ did not add are released', async () => {
      const harness = await createMemoryHarness();

      harness.failNextAdd('not-added');

      await expect(enqueueBatch(harness)).rejects.toThrow('connection lost');
      expect(await harness.readTotalChargedBytes()).toBe(0);
    });

    it('jobs BullMQ added before the error keep their charge, as they will run', async () => {
      const harness = await createMemoryHarness();

      harness.failNextAdd('added-but-unacknowledged');

      await expect(enqueueBatch(harness)).rejects.toThrow('connection lost');
      expect(harness.storedJobIds()).toHaveLength(2);
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBeGreaterThan(0);
    });

    it('when BullMQ cannot tell whether the jobs were added, the charge is kept rather than lost', async () => {
      const harness = await createMemoryHarness();

      harness.failNextAdd('unknown-outcome');

      await expect(enqueueBatch(harness)).rejects.toThrow('connection lost');
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBeGreaterThan(0);
    });
  });

  describe('S10: jobs that are not owned by a tenant', () => {
    it('system jobs are not charged and report no availability', async () => {
      const harness = await createMemoryHarness();

      const { jobs, availableBytes } = await harness.enqueueBulk([
        {
          data: { label: 'S1', payload: 'x'.repeat(2_000) },
          isSystemJob: true,
        },
      ]);

      expect(jobs).toHaveLength(1);
      expect(jobs[0].sizeBytes).toBeGreaterThan(2_000);
      expect(availableBytes).toBeNull();
      expect(await harness.readTotalChargedBytes()).toBe(0);
    });

    it('additional fairness group keys are not charged, the workspace and application keys are', async () => {
      const harness = await createMemoryHarness();

      await harness.enqueueBulk(
        [
          harness.buildApplicationJob({
            label: 'A1',
            workspaceId: 'A',
            payloadBytes: 2_000,
          }),
        ],
        { groupKeys: ['logic-function:fn-1'] },
      );

      expect(await harness.readUsedBytes('logic-function:fn-1')).toBe(0);
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBeGreaterThan(0);
      expect(await harness.readUsedBytes(APPLICATION)).toBeGreaterThan(0);
    });

    it('core workspace jobs are charged to the workspace only', async () => {
      const harness = await createMemoryHarness();

      await harness.enqueue({
        label: 'A1',
        payloadBytes: 2_000,
        options: { workspaceId: 'A', isWorkspaceJob: true },
      });

      expect(await harness.readUsedBytes(WORKSPACE_A)).toBeGreaterThan(2_000);
      expect(await harness.readUsedBytes(APPLICATION)).toBe(0);
    });
  });

  describe('S11: A enqueues a job bigger than the job size cap', () => {
    it('the batch is refused before any memory is charged', async () => {
      const harness = await createMemoryHarness({
        maxMemoryBytes: 10_000_000,
        maxJobSizeBytes: 10_000,
      });

      await expectMessageQueueException(
        harness.enqueueBulk([
          harness.buildApplicationJob({
            label: 'A1',
            workspaceId: 'A',
            payloadBytes: 2_000,
          }),
          harness.buildApplicationJob({
            label: 'A2',
            workspaceId: 'A',
            payloadBytes: 20_000,
          }),
        ]),
        MessageQueueExceptionCode.JOB_TOO_LARGE,
      );

      expect(harness.storedJobIds()).toEqual([]);
      expect(await harness.readTotalChargedBytes()).toBe(0);
    });
  });

  describe('S12: memory fairness is disabled', () => {
    it('jobs are added uncapped and uncharged, sizes are still reported with a null availability', async () => {
      const harness = await createMemoryHarness({
        isEnabled: false,
        maxJobSizeBytes: 10_000,
      });

      const { jobs, availableBytes } = await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'A1',
          workspaceId: 'A',
          payloadBytes: 50_000,
        }),
      ]);

      expect(jobs[0].sizeBytes).toBeGreaterThan(50_000);
      expect(availableBytes).toBeNull();
      expect(await harness.readTotalChargedBytes()).toBe(0);
      expect(harness.storedJob(jobs[0].jobId)?.opts.memoryGroupKeys).toBe(
        undefined,
      );
    });
  });

  describe('S13: Redis has no maxmemory', () => {
    it('jobs are admitted uncharged, as there is no capacity to share', async () => {
      const harness = await createMemoryHarness({ maxMemoryBytes: 0 });

      const { jobs, availableBytes } = await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'A1',
          workspaceId: 'A',
          payloadBytes: 50_000,
        }),
      ]);

      expect(jobs).toHaveLength(1);
      expect(availableBytes).toBeNull();
      expect(await harness.readTotalChargedBytes()).toBe(0);
    });
  });

  describe('S14: the limiter scripts fail on Redis', () => {
    it('jobs are still enqueued, uncharged, so the limiter never blocks the queue', async () => {
      const harness = await createMemoryHarness();

      harness.breakRedis();

      const { jobs, availableBytes } = await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'A1',
          workspaceId: 'A',
          payloadBytes: 50_000,
        }),
      ]);

      expect(harness.storedJobIds()).toEqual([jobs[0].jobId]);
      expect(availableBytes).toBeNull();
      expect(await harness.readTotalChargedBytes()).toBe(0);
    });
  });

  describe('S15: charged keys of A stay idle for a long time', () => {
    it('charges never expire, so a long-delayed job keeps its charge', async () => {
      const harness = await createMemoryHarness();

      await harness.enqueueBulk([
        harness.buildApplicationJob({ label: 'A1', workspaceId: 'A' }),
      ]);

      expect(await harness.readTtl(WORKSPACE_A)).toBe(-1);
      expect(await harness.readTtl(APPLICATION)).toBe(-1);
    });
  });

  describe('S16: the memory used ratio gauge', () => {
    it('reports used memory over the capacity given to jobs', async () => {
      const harness = await createMemoryHarness({ otherDataBytes: 45_000 });

      harness.driver.onModuleInit();

      expect(await harness.readGaugeCallback()()).toEqual([
        { value: 45_000 / CAPACITY_BYTES, attributes: {} },
      ]);
    });
  });

  describe('S17: A fills its share, then one of its waiting jobs is deleted outside the worker', () => {
    it('the reconcile cron gives the charge back on its second pass, so A can enqueue again', async () => {
      const harness = await createMemoryHarness();

      const {
        jobs: [deletedJob],
      } = await harness.enqueueBulk([
        harness.buildApplicationJob({
          label: 'A1',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
        harness.buildApplicationJob({
          label: 'A2',
          workspaceId: 'A',
          payloadBytes: 2_000,
        }),
      ]);
      const enqueueThirdJob = () =>
        harness.enqueueBulk([
          harness.buildApplicationJob({
            label: 'A3',
            workspaceId: 'A',
            payloadBytes: 2_000,
          }),
        ]);

      await harness.removeFromBullMQ(deletedJob.jobId);
      await expect(enqueueThirdJob()).rejects.toThrow(MessageQueueException);

      await harness.driver.reconcileJobMemory();
      await expect(enqueueThirdJob()).rejects.toThrow(MessageQueueException);

      expect(await harness.driver.reconcileJobMemory()).toEqual({
        releasedCount: 2,
        releasedBytes: 2 * deletedJob.sizeBytes,
      });
      await expect(enqueueThirdJob()).resolves.toMatchObject({
        jobs: [expect.anything()],
      });
    });
  });

  describe('S18: an administrator deletes one of the waiting jobs of A', () => {
    const buildDeletedJob = (
      harness: Awaited<ReturnType<typeof createMemoryHarness>>,
    ) =>
      harness.buildApplicationJob({
        label: 'A1',
        workspaceId: 'A',
        payloadBytes: 2_000,
        jobId: 'deleted-id',
      });

    it('the job is removed and its workspace and application charges are released', async () => {
      const harness = await createMemoryHarness();

      await harness.enqueueBulk([buildDeletedJob(harness)]);

      await expect(harness.removeJob('deleted-id')).resolves.toBe(true);

      expect(harness.storedJobIds()).toEqual([]);
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(0);
      expect(await harness.readUsedBytes(APPLICATION)).toBe(0);
    });

    it('a locked job is kept with its charges', async () => {
      const harness = await createMemoryHarness();
      const {
        jobs: [lockedJob],
      } = await harness.enqueueBulk([buildDeletedJob(harness)]);

      harness.lockJob('deleted-id');

      await expect(harness.removeJob('deleted-id')).rejects.toThrow(
        'Job deleted-id is locked',
      );
      expect(harness.storedJobIds()).toEqual(['deleted-id']);
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(
        lockedJob.sizeBytes,
      );
      expect(await harness.readUsedBytes(APPLICATION)).toBe(
        lockedJob.sizeBytes,
      );
    });

    it('a locked job that finishes during the deletion is not charged back', async () => {
      const harness = await createMemoryHarness();

      await harness.enqueueBulk([buildDeletedJob(harness)]);
      harness.lockJob('deleted-id');
      harness.onBeforeRemove(() => harness.markFinished('deleted-id'));

      await expect(harness.removeJob('deleted-id')).rejects.toThrow(
        'Job deleted-id is locked',
      );
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(0);
      expect(await harness.readUsedBytes(APPLICATION)).toBe(0);
    });

    it('an unknown job is reported as not removed', async () => {
      const harness = await createMemoryHarness();

      await expect(harness.removeJob('unknown-id')).resolves.toBe(false);
    });

    it('the same id enqueued again during the deletion is charged once it is added back', async () => {
      const harness = await createMemoryHarness();

      await harness.enqueueBulk([buildDeletedJob(harness)]);
      harness.onBeforeRemove(async () => {
        await harness.enqueueBulk([buildDeletedJob(harness)]);
      });

      await harness.removeJob('deleted-id');
      harness.onBeforeRemove(async () => undefined);

      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(0);

      const {
        jobs: [replacementJob],
      } = await harness.enqueueBulk([buildDeletedJob(harness)]);

      expect(harness.storedJobIds()).toEqual(['deleted-id']);
      expect(await harness.readUsedBytes(WORKSPACE_A)).toBe(
        replacementJob.sizeBytes,
      );
    });
  });
});

describe('retained job payloads', () => {
  beforeAll(silenceDriverLogs);

  const enqueueOrThrow = async (
    harness: Awaited<ReturnType<typeof createMemoryHarness>>,
    payloadBytes: number,
  ) => {
    const jobId = await harness.enqueue({
      label: 'retained',
      payloadBytes,
      options: { workspaceId: 'A', isWorkspaceJob: true },
    });

    if (!isDefined(jobId)) {
      throw new Error('Expected an enqueued job');
    }

    return jobId;
  };

  it('replaces oversized successful job data with its size and hash', async () => {
    const harness = await createMemoryHarness({
      isEnabled: false,
      maxJobSizeBytes: 1_000,
    });
    const jobId = await enqueueOrThrow(harness, 2_000);
    const storedJob = harness.storedJob(jobId);
    const expectedData = {
      memorySizeBytes: computeJobSizeBytes({
        data: storedJob?.data,
        options: storedJob?.opts,
      }),
      hash: createHash('sha256')
        .update(JSON.stringify(storedJob?.data))
        .digest('hex'),
    };
    const handler = jest.fn(
      async ({ data }: { data: { payload?: string } }) => {
        expect(data.payload).toHaveLength(2_000);
      },
    );

    await harness.processJobOrThrow({ jobId, handler });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(harness.storedJob(jobId)?.data).toEqual(expectedData);
    expect(expectedData.memorySizeBytes).toBeGreaterThan(1_000);
  });

  it('keeps successful job data under the maximum job size', async () => {
    const harness = await createMemoryHarness({ maxJobSizeBytes: 10_000 });
    const jobId = await enqueueOrThrow(harness, 2_000);

    await harness.processJobOrThrow({ jobId });

    expect(harness.storedJob(jobId)?.data.payload).toHaveLength(2_000);
    expect(await harness.readUsedBytes('workspace:A')).toBe(0);
  });

  it('keeps oversized failed job data for a manual retry', async () => {
    const harness = await createMemoryHarness({
      isEnabled: false,
      maxJobSizeBytes: 1_000,
    });
    const jobId = await enqueueOrThrow(harness, 2_000);

    await harness.processJobOrThrow({
      jobId,
      handler: async () => {
        throw new Error('transient failure');
      },
    });

    expect(harness.storedJob(jobId)?.data.payload).toHaveLength(2_000);
  });
});
