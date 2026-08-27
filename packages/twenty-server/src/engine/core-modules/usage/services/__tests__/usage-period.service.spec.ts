import { Test, type TestingModule } from '@nestjs/testing';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage/services/usage-period.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('UsagePeriodService', () => {
  let service: UsagePeriodService;

  const twentyConfigService = {
    get: jest.fn(),
  };

  const workspaceCacheService = {
    getOrRecompute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsagePeriodService,
        { provide: TwentyConfigService, useValue: twentyConfigService },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
      ],
    }).compile();

    service = module.get(UsagePeriodService);
  });

  it('returns the subscription period when billing is enabled and a subscription exists', async () => {
    twentyConfigService.get.mockReturnValue(true);
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      currentBillingSubscription: {
        currentPeriodStart: '2026-08-15T00:00:00.000Z',
        currentPeriodEnd: '2026-09-15T00:00:00.000Z',
      },
    });

    const { periodStart, periodEnd } =
      await service.getCurrentPeriod('workspace-1');

    expect(periodStart).toEqual(new Date('2026-08-15T00:00:00.000Z'));
    expect(periodEnd).toEqual(new Date('2026-09-15T00:00:00.000Z'));
  });

  it('falls back to the calendar month when there is no subscription', async () => {
    twentyConfigService.get.mockReturnValue(true);
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      currentBillingSubscription: NO_BILLING_SUBSCRIPTION,
    });

    const { periodStart, periodEnd } =
      await service.getCurrentPeriod('workspace-1');

    expect(periodStart.getUTCDate()).toBe(1);
    expect(periodEnd.getTime()).toBeGreaterThan(periodStart.getTime());
  });

  it('falls back to the calendar month without reading the cache when billing is disabled', async () => {
    twentyConfigService.get.mockReturnValue(false);

    const { periodStart } = await service.getCurrentPeriod('workspace-1');

    expect(periodStart.getUTCDate()).toBe(1);
    expect(workspaceCacheService.getOrRecompute).not.toHaveBeenCalled();
  });
});
