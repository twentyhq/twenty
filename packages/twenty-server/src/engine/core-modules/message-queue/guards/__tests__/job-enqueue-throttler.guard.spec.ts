import { Test, type TestingModule } from '@nestjs/testing';

import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { JobEnqueueThrottlerGuard } from 'src/engine/core-modules/message-queue/guards/job-enqueue-throttler.guard';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
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

  it('does nothing when there is no auth context', async () => {
    await guard.assertCanEnqueueOrThrow(1);

    expect(throttlerService.getAvailableTokensCount).not.toHaveBeenCalled();
    expect(throttlerService.consumeTokens).not.toHaveBeenCalled();
  });

  it('does nothing for non-application auth contexts', async () => {
    await withWorkspaceAuthContext(
      // oxlint-disable-next-line typescript/no-explicit-any
      { type: 'system', workspace: { id: 'workspace-id' } } as any,
      () => guard.assertCanEnqueueOrThrow(1),
    );

    expect(throttlerService.getAvailableTokensCount).not.toHaveBeenCalled();
    expect(throttlerService.consumeTokens).not.toHaveBeenCalled();
  });

  it('debits both application and registration buckets with distinct limits', async () => {
    await withWorkspaceAuthContext(buildApplicationContext(application), () =>
      guard.assertCanEnqueueOrThrow(1),
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
    await withWorkspaceAuthContext(buildApplicationContext(application), () =>
      guard.assertCanEnqueueOrThrow(5),
    );

    expect(throttlerService.consumeTokens).toHaveBeenCalledWith(
      APPLICATION_KEY,
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

    expect(throttlerService.consumeTokens).toHaveBeenCalledWith(
      'enqueue:throttler:application-registration:universal-id',
      1,
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
      withWorkspaceAuthContext(buildApplicationContext(application), () =>
        guard.assertCanEnqueueOrThrow(1),
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
      withWorkspaceAuthContext(buildApplicationContext(application), () =>
        guard.assertCanEnqueueOrThrow(1),
      ),
    ).rejects.toThrow(ThrottlerException);

    expect(throttlerService.consumeTokens).not.toHaveBeenCalled();
  });
});
