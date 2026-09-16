import { Test, type TestingModule } from '@nestjs/testing';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { ApplicationJobEnqueueThrottlerService } from 'src/engine/core-modules/message-queue/services/application-job-enqueue-throttler.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const APPLICATION_ID = 'application-id';
const APPLICATION_REGISTRATION_ID = 'application-registration-id';

const CONFIG: Record<string, number> = {
  APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS: 60_000,
  APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT: 500,
  APPLICATION_REGISTRATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT: 2_000,
};

describe('ApplicationJobEnqueueThrottlerService', () => {
  let service: ApplicationJobEnqueueThrottlerService;
  let throttlerService: {
    getAvailableTokensCount: jest.Mock;
    consumeTokens: jest.Mock;
  };

  const reserve = (jobCount: number) =>
    service.reserveEnqueueDelay({
      applicationId: APPLICATION_ID,
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      jobCount,
    });

  beforeEach(async () => {
    throttlerService = {
      getAvailableTokensCount: jest.fn().mockResolvedValue(500),
      consumeTokens: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationJobEnqueueThrottlerService,
        { provide: ThrottlerService, useValue: throttlerService },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn((key: string) => CONFIG[key]) },
        },
        {
          provide: MetricsService,
          useValue: {
            incrementCounterForEvent: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationJobEnqueueThrottlerService);
  });

  it('does not delay an enqueue that fits in the remaining budget', async () => {
    expect(await reserve(100)).toEqual({ delayMs: 0, isCapped: false });
  });

  it('delays by the time the missing tokens take to refill', async () => {
    throttlerService.getAvailableTokensCount.mockResolvedValue(400);

    // 100 tokens missing at 500 per 60s refills in 12s.
    expect(await reserve(500)).toEqual({ delayMs: 12_000, isCapped: false });
  });

  it('spends the budget even when the enqueue is delayed, so the next caller waits longer', async () => {
    throttlerService.getAvailableTokensCount.mockResolvedValue(0);

    await reserve(500);

    expect(throttlerService.consumeTokens).toHaveBeenCalledWith(
      `enqueue:throttler:application:${APPLICATION_ID}`,
      500,
      500,
      60_000,
    );
  });

  it('reports a delay clamped to the ceiling as capped', async () => {
    throttlerService.getAvailableTokensCount.mockResolvedValue(-500_000);

    const { delayMs, isCapped } = await reserve(1);

    expect(delayMs).toBe(60 * 60 * 1_000);
    expect(isCapped).toBe(true);
  });

  it('throttleOrThrow still refuses an enqueue over the budget', async () => {
    throttlerService.getAvailableTokensCount.mockResolvedValue(10);

    await expect(
      service.throttleOrThrow({
        applicationId: APPLICATION_ID,
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        jobCount: 500,
      }),
    ).rejects.toThrow('Application job enqueue limit reached');
  });
});
