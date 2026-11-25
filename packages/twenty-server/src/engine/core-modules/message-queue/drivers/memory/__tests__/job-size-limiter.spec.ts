import { JobSizeLimiter } from 'src/engine/core-modules/message-queue/drivers/memory/job-size-limiter';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const MAX_JOB_SIZE_BYTES = 100;

const buildLimiter = () => {
  const metricsService = { incrementCounterForEvent: jest.fn() };
  const configValues: Record<string, unknown> = {
    JOB_QUEUE_MAX_JOB_SIZE_BYTES: MAX_JOB_SIZE_BYTES,
  };
  const limiter = new JobSizeLimiter(
    metricsService as never,
    { get: (key: string) => configValues[key] } as never,
  );

  return { limiter, metricsService };
};

const JOBS = [
  { index: 0, groupKey: 'workspace:ws-1', sizeBytes: 50 },
  { index: 3, groupKey: 'workspace:ws-1', sizeBytes: 150 },
  { index: 4, groupKey: 'workspace:ws-2', sizeBytes: 200 },
];

describe('JobSizeLimiter', () => {
  it('refuses the batch on the first oversized job and counts it once', () => {
    const { limiter, metricsService } = buildLimiter();

    let thrownError: unknown;

    try {
      limiter.checkJobSizesOrThrow({
        queueName: MessageQueue.workspaceQueue,
        jobName: 'job',
        jobs: JOBS,
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(MessageQueueException);
    expect(thrownError).toMatchObject({
      code: MessageQueueExceptionCode.JOB_TOO_LARGE,
      statusCode: 413,
      details: { index: 3, sizeBytes: 150, maxBytes: MAX_JOB_SIZE_BYTES },
    });
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledTimes(1);
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledWith({
      key: MetricsKeys.JobMemoryLimitRefused,
      attributes: {
        queue: MessageQueue.workspaceQueue,
        job_name: 'job',
        reason: 'size',
      },
      shouldStoreInCache: false,
    });
  });

  it('admits jobs at the limit', () => {
    const { limiter } = buildLimiter();

    expect(() =>
      limiter.checkJobSizesOrThrow({
        queueName: MessageQueue.workspaceQueue,
        jobName: 'job',
        jobs: [{ index: 0, groupKey: 'system', sizeBytes: MAX_JOB_SIZE_BYTES }],
      }),
    ).not.toThrow();
  });
});
