import { Test, type TestingModule } from '@nestjs/testing';

import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { JobEnqueueThrottlerGuard } from 'src/engine/core-modules/message-queue/guards/job-enqueue-throttler.guard';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const CONFIG = {
  APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS: 60_000,
  APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT: 500,
  APPLICATION_REGISTRATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT: 2000,
} as const;

// oxlint-disable-next-line typescript/no-explicit-any
const buildApplicationContext = (application: any): WorkspaceAuthContext =>
  ({
    type: 'application',
    workspace: { id: 'workspace-id' },
    application,
    // oxlint-disable-next-line typescript/no-explicit-any
  }) as any;

const application = {
  id: 'application-id',
  applicationRegistrationId: 'registration-id',
  universalIdentifier: 'universal-id',
  name: 'My App',
  sourceType: 'LOCAL',
};

describe('JobEnqueueThrottlerGuard', () => {
  let guard: JobEnqueueThrottlerGuard;
  let throttlerService: { tokenBucketThrottleOrThrow: jest.Mock };
  let metricsService: { incrementCounterForEvent: jest.Mock };

  beforeEach(async () => {
    throttlerService = {
      tokenBucketThrottleOrThrow: jest.fn().mockResolvedValue(1),
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

  it('does nothing when there is no auth context', async () => {
    await guard.assertCanEnqueueOrThrow(1);

    expect(throttlerService.tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
  });

  it('does nothing for non-application auth contexts', async () => {
    await withWorkspaceAuthContext(
      // oxlint-disable-next-line typescript/no-explicit-any
      { type: 'system', workspace: { id: 'workspace-id' } } as any,
      () => guard.assertCanEnqueueOrThrow(1),
    );

    expect(throttlerService.tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
  });

  it('throttles per application and per registration with distinct limits', async () => {
    await withWorkspaceAuthContext(buildApplicationContext(application), () =>
      guard.assertCanEnqueueOrThrow(1),
    );

    expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenCalledTimes(
      2,
    );
    expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenNthCalledWith(
      1,
      'enqueue:throttler:application:application-id',
      1,
      CONFIG.APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT,
      CONFIG.APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS,
    );
    expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenNthCalledWith(
      2,
      'enqueue:throttler:application-registration:registration-id',
      1,
      CONFIG.APPLICATION_REGISTRATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT,
      CONFIG.APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS,
    );
  });

  it('consumes one token per job for bulk enqueue', async () => {
    await withWorkspaceAuthContext(buildApplicationContext(application), () =>
      guard.assertCanEnqueueOrThrow(5),
    );

    expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenNthCalledWith(
      1,
      'enqueue:throttler:application:application-id',
      5,
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('falls back to the universal identifier when there is no registration', async () => {
    await withWorkspaceAuthContext(
      buildApplicationContext({
        ...application,
        applicationRegistrationId: null,
      }),
      () => guard.assertCanEnqueueOrThrow(1),
    );

    expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenNthCalledWith(
      2,
      'enqueue:throttler:application-registration:universal-id',
      1,
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('records a metric and rethrows when the limit is reached', async () => {
    throttlerService.tokenBucketThrottleOrThrow.mockRejectedValueOnce(
      new ThrottlerException(
        'Limit reached',
        ThrottlerExceptionCode.LIMIT_REACHED,
      ),
    );

    await expect(
      withWorkspaceAuthContext(buildApplicationContext(application), () =>
        guard.assertCanEnqueueOrThrow(1),
      ),
    ).rejects.toThrow(ThrottlerException);

    expect(metricsService.incrementCounterForEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        key: MetricsKeys.JobEnqueueApplicationRateLimited,
      }),
    );
  });
});
