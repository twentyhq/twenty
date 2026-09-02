import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type CurrentBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-1111-0000-0000-000000000001';
const WARM_AVAILABLE_CREDITS = 5_000_000;

const SUBSCRIPTION = {
  workspaceId: WORKSPACE_ID,
  currentPeriodStart: new Date('2026-09-01T00:00:00.000Z'),
  currentPeriodEnd: new Date('2026-10-01T00:00:00.000Z'),
} as CurrentBillingSubscription;

describe('BillingUsageService', () => {
  let billingUsageService: BillingUsageService;
  let adjustAvailableCredits: jest.Mock;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    adjustAvailableCredits = jest.fn(
      async (_workspaceId: string, _periodStart: Date, adjustment: number) =>
        WARM_AVAILABLE_CREDITS + adjustment,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingUsageService,
        {
          provide: BillingUsageCacheService,
          useValue: {
            getAvailableCredits: jest
              .fn()
              .mockResolvedValue(WARM_AVAILABLE_CREDITS),
            adjustAvailableCredits,
          },
        },
        { provide: BillingCreditGrantService, useValue: {} },
        { provide: BillingSubscriptionService, useValue: {} },
        { provide: BillingSubscriptionItemService, useValue: {} },
        { provide: TwentyConfigService, useValue: { get: jest.fn() } },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingSubscriptionEntity),
          useValue: {},
        },
        { provide: WorkspaceCacheService, useValue: {} },
        { provide: ClickHouseService, useValue: {} },
        { provide: CacheLockService, useValue: {} },
        { provide: CoreEntityCacheService, useValue: {} },
      ],
    }).compile();

    billingUsageService = module.get<BillingUsageService>(BillingUsageService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const decrement = (usedCredits: number) =>
    billingUsageService.decrementAvailableCreditsInCache({
      workspaceId: WORKSPACE_ID,
      usedCredits,
      currentBillingSubscription: SUBSCRIPTION,
    });

  describe('decrementAvailableCreditsInCache', () => {
    it('should subtract a positive amount from the warm counter', async () => {
      await expect(decrement(1_000_000)).resolves.toBe(4_000_000);
    });

    // A negative decrement adds to the counter, handing the workspace credits it
    // never bought, and INCRBY rejects anything that is not an integer.
    it.each([
      ['a negative amount', -1_000_000],
      ['negative infinity', Number.NEGATIVE_INFINITY],
      ['positive infinity', Number.POSITIVE_INFINITY],
      ['NaN', Number.NaN],
      ['a fractional amount', 1_000.5],
      ['an amount beyond the safe integer range', Number.MAX_SAFE_INTEGER + 2],
    ])('should leave the counter untouched for %s', async (_case, amount) => {
      await expect(decrement(amount)).resolves.toBe(WARM_AVAILABLE_CREDITS);
    });

    it('should leave the counter untouched for zero', async () => {
      await expect(decrement(0)).resolves.toBe(WARM_AVAILABLE_CREDITS);
    });
  });
});
