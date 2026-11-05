import { JobSizeLimiter } from 'src/engine/core-modules/message-queue/drivers/memory/job-size-limiter';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { type JobQueueMemoryLimitMode } from 'src/engine/core-modules/message-queue/types/job-queue-memory-limit-mode.type';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const MAX_JOB_SIZE_BYTES = 100;

const buildLimiter = (mode: JobQueueMemoryLimitMode) => {
  const metricsService = { incrementCounterForEvent: jest.fn() };
  const limiter = new JobSizeLimiter({
    metricsService: metricsService as never,
    getMode: () => mode,
    getMaxJobSizeBytes: () => MAX_JOB_SIZE_BYTES,
  });

  return { limiter, metricsService };
};

const JOBS = [
  { groupKey: 'workspace:ws-1', sizeBytes: 50 },
  { groupKey: 'workspace:ws-1', sizeBytes: 150 },
  { groupKey: 'workspace:ws-2', sizeBytes: 200 },
];

describe('JobSizeLimiter', () => {
  it('ignores sizes when off', () => {
    const { limiter, metricsService } = buildLimiter('off');

    expect(() =>
      limiter.checkJobSizes({
        queueName: MessageQueue.workspaceQueue,
        jobs: JOBS,
      }),
    ).not.toThrow();
    expect(metricsService.incrementCounterForEvent).not.toHaveBeenCalled();
  });

  it('counts each oversized job without refusing in observe', () => {
    const { limiter, metricsService } = buildLimiter('observe');

    expect(() =>
      limiter.checkJobSizes({
        queueName: MessageQueue.workspaceQueue,
        jobs: JOBS,
      }),
    ).not.toThrow();
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledTimes(2);
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledWith({
      key: MetricsKeys.JobMemoryLimitRefused,
      attributes: {
        queue: MessageQueue.workspaceQueue,
        reason: 'size',
        mode: 'observe',
      },
      shouldStoreInCache: false,
    });
  });

  it('refuses the batch on the first oversized job in enforce', () => {
    const { limiter } = buildLimiter('enforce');

    let thrownError: unknown;

    try {
      limiter.checkJobSizes({
        queueName: MessageQueue.workspaceQueue,
        jobs: JOBS,
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(MessageQueueException);
    expect(thrownError).toMatchObject({
      code: MessageQueueExceptionCode.JOB_TOO_LARGE,
      statusCode: 413,
      details: { index: 1, sizeBytes: 150, maxBytes: MAX_JOB_SIZE_BYTES },
    });
  });

  it('admits jobs at the limit in enforce', () => {
    const { limiter } = buildLimiter('enforce');

    expect(() =>
      limiter.checkJobSizes({
        queueName: MessageQueue.workspaceQueue,
        jobs: [{ groupKey: 'system', sizeBytes: MAX_JOB_SIZE_BYTES }],
      }),
    ).not.toThrow();
  });
});
