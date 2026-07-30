import { Test, type TestingModule } from '@nestjs/testing';

import { JobEnqueueThrottlerGuard } from 'src/engine/core-modules/message-queue/guards/job-enqueue-throttler.guard';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  type ApplicationJobEnqueueContext,
  withApplicationJobEnqueueContext,
} from 'src/engine/core-modules/message-queue/storage/application-job-enqueue-context.storage';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const CONFIG = {
  APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS: 60_000,
  APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT: 500,
  APPLICATION_REGISTRATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT: 2000,
} as const;

const GUARDED_QUEUE = MessageQueue.logicFunctionQueue;
const UNGUARDED_QUEUE = MessageQueue.emailQueue;

const context: ApplicationJobEnqueueContext = {
  applicationId: 'application-id',
  applicationRegistrationId: 'registration-id',
};

const APPLICATION_KEY = 'enqueue:throttler:application:application-id';
const REGISTRATION_KEY =
  'enqueue:throttler:application-registration:registration-id';

describe('JobEnqueueThrottlerGuard', () => {
  let guard: JobEnqueueThrottlerGuard;
  let throttlerService: {
    getAvailableTokensCount: jest.Mock;
    consumeTokens: jest.Mock;
  };
  let metricsService: { incrementCounterForEvent: jest.Mock };

  const mockAvailableTokens = (byKey: Record<string, number>) => {
    throttlerService.getAvailableTokensCount.mockImplementation(
      async (key: string) => byKey[key] ?? 0,
    );
  };

  beforeEach(async () => {
    throttlerService = {
      getAvailableTokensCount: jest.fn().mockResolvedValue(1000),
      consumeTokens: jest.fn().mockResolvedValue(undefined),
    };
    metricsService = {
      incrementCounterForEvent: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobEnqueueThrottlerGuard,
        { provide: ThrottlerService, useValue: throttlerService },
        { provide: MetricsService, useValue: metricsService },
        {
          provide: TwentyConfigService,
          useValue: {
            get: (key: keyof typeof CONFIG) => CONFIG[key],
          },
        },
      ],
    }).compile();

    guard = module.get(JobEnqueueThrottlerGuard);
  });

  it('does nothing for non-guarded queues even without a context', async () => {
    await guard.assertCanEnqueueOrThrow(UNGUARDED_QUEUE, 1);

    expect(throttlerService.getAvailableTokensCount).not.toHaveBeenCalled();
    expect(throttlerService.consumeTokens).not.toHaveBeenCalled();
  });

  it('throws for a guarded queue when there is no enqueue context', async () => {
    await expect(
      guard.assertCanEnqueueOrThrow(GUARDED_QUEUE, 1),
    ).rejects.toThrow(/application enqueue context/);

    expect(throttlerService.consumeTokens).not.toHaveBeenCalled();
  });

  it('throws for a guarded queue when the registration id is missing', async () => {
    await expect(
      withApplicationJobEnqueueContext(
        // oxlint-disable-next-line typescript/no-explicit-any
        { applicationId: 'application-id' } as any,
        () => guard.assertCanEnqueueOrThrow(GUARDED_QUEUE, 1),
      ),
    ).rejects.toThrow(/application enqueue context/);
  });

  it('debits both application and registration buckets with distinct limits', async () => {
    await withApplicationJobEnqueueContext(context, () =>
      guard.assertCanEnqueueOrThrow(GUARDED_QUEUE, 1),
    );

    expect(throttlerService.consumeTokens).toHaveBeenCalledWith(
      APPLICATION_KEY,
      1,
      CONFIG.APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT,
      CONFIG.APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS,
    );
    expect(throttlerService.consumeTokens).toHaveBeenCalledWith(
      REGISTRATION_KEY,
      1,
      CONFIG.APPLICATION_REGISTRATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT,
      CONFIG.APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS,
    );
  });

  it('consumes one token per job for bulk enqueue', async () => {
    await withApplicationJobEnqueueContext(context, () =>
      guard.assertCanEnqueueOrThrow(GUARDED_QUEUE, 5),
    );

    expect(throttlerService.consumeTokens).toHaveBeenCalledWith(
      APPLICATION_KEY,
      5,
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('does not debit any bucket when the registration bucket is exhausted', async () => {
    mockAvailableTokens({
      [APPLICATION_KEY]: 1000,
      [REGISTRATION_KEY]: 0,
    });

    await expect(
      withApplicationJobEnqueueContext(context, () =>
        guard.assertCanEnqueueOrThrow(GUARDED_QUEUE, 1),
      ),
    ).rejects.toThrow(ThrottlerException);

    expect(throttlerService.consumeTokens).not.toHaveBeenCalled();
    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        key: MetricsKeys.JobEnqueueApplicationRateLimited,
      }),
    );
  });

  it('does not debit any bucket when the application bucket is exhausted', async () => {
    mockAvailableTokens({
      [APPLICATION_KEY]: 0,
      [REGISTRATION_KEY]: 1000,
    });

    await expect(
      withApplicationJobEnqueueContext(context, () =>
        guard.assertCanEnqueueOrThrow(GUARDED_QUEUE, 1),
      ),
    ).rejects.toThrow(ThrottlerException);

    expect(throttlerService.consumeTokens).not.toHaveBeenCalled();
  });
});
