import { ServerCronDispatchRateLimiterService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/services/server-cron-dispatch-rate-limiter.service';
import { type ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('ServerCronDispatchRateLimiterService', () => {
  const getAvailableTokensCount = jest.fn();
  const consumeTokens = jest.fn();
  const configValues: Record<string, number> = {
    APPLICATION_REGISTRATION_SERVER_CRON_DISPATCH_RATE_LIMITING_LIMIT: 60,
    APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS: 60_000,
  };

  const service = new ServerCronDispatchRateLimiterService(
    { getAvailableTokensCount, consumeTokens } as unknown as ThrottlerService,
    {
      get: (key: string) => configValues[key],
    } as unknown as TwentyConfigService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not delay dispatches that fit in the available tokens', async () => {
    getAvailableTokensCount.mockResolvedValue(60);

    const delaysMs = await service.computeDispatchDelaysMs({
      applicationRegistrationId: 'registration-1',
      dispatchCount: 3,
    });

    expect(delaysMs).toEqual([0, 0, 0]);
    expect(consumeTokens).toHaveBeenCalledWith(
      'server-cron-dispatch:throttler:application-registration:registration-1',
      3,
      60,
      60_000,
    );
  });

  it('delays dispatches beyond the available tokens by their refill time', async () => {
    getAvailableTokensCount.mockResolvedValue(1);

    const delaysMs = await service.computeDispatchDelaysMs({
      applicationRegistrationId: 'registration-1',
      dispatchCount: 3,
    });

    expect(delaysMs).toEqual([0, 1_000, 2_000]);
  });

  it('keeps delaying while the registration is in debt', async () => {
    getAvailableTokensCount.mockResolvedValue(-2);

    const delaysMs = await service.computeDispatchDelaysMs({
      applicationRegistrationId: 'registration-1',
      dispatchCount: 2,
    });

    expect(delaysMs).toEqual([3_000, 4_000]);
  });

  it('does not touch the bucket when there is nothing to dispatch', async () => {
    const delaysMs = await service.computeDispatchDelaysMs({
      applicationRegistrationId: 'registration-1',
      dispatchCount: 0,
    });

    expect(delaysMs).toEqual([]);
    expect(getAvailableTokensCount).not.toHaveBeenCalled();
    expect(consumeTokens).not.toHaveBeenCalled();
  });
});
