/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const workspaceId = 'ws_123';
const PERIOD_START = new Date('2026-01-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-02-01T00:00:00.000Z');
const ALLOWANCE = 1_000_000;

const currentBillingSubscription = {
  workspaceId,
  status: SubscriptionStatus.Active,
  currentPeriodStart: PERIOD_START,
  currentPeriodEnd: PERIOD_END,
};

const subscriptionWithAllowance = {
  workspaceId,
  status: SubscriptionStatus.Active,
  currentPeriodStart: PERIOD_START,
  currentPeriodEnd: PERIOD_END,
  billingSubscriptionItems: [
    {
      stripePriceId: 'price_1',
      billingProduct: {
        metadata: { productKey: BillingProductKey.RESOURCE_CREDIT },
        billingPrices: [
          {
            stripePriceId: 'price_1',
            metadata: { credit_amount: String(ALLOWANCE) },
          },
        ],
      },
    },
  ],
};

describe('BillingUsageService', () => {
  let service: BillingUsageService;
  let billingUsageCacheService: jest.Mocked<{
    getAvailableCredits: jest.Mock;
    warmAvailableCredits: jest.Mock;
    adjustAvailableCredits: jest.Mock;
  }>;
  let billingCreditGrantService: jest.Mocked<{
    getSpendableCreditsMicro: jest.Mock;
  }>;
  let cacheLockService: jest.Mocked<{ withLock: jest.Mock }>;
  let clickHouseService: jest.Mocked<{ select: jest.Mock }>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingUsageService,
        {
          provide: BillingCreditGrantService,
          useValue: { getSpendableCreditsMicro: jest.fn().mockResolvedValue(0) },
        },
        {
          provide: BillingSubscriptionService,
          useValue: {
            getTrialPeriodFreeWorkflowCredits: jest.fn().mockReturnValue(0),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue(true) },
        },
        {
          provide: BillingSubscriptionItemService,
          useValue: {
            getResourceCreditSubscriptionItemDetails: jest.fn(),
          },
        },
        {
          provide: BillingUsageCacheService,
          useValue: {
            getAvailableCredits: jest.fn().mockResolvedValue(undefined),
            warmAvailableCredits: jest.fn().mockResolvedValue(true),
            adjustAvailableCredits: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingSubscriptionEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue(subscriptionWithAllowance),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest
              .fn()
              .mockResolvedValue({ currentBillingSubscription }),
          },
        },
        {
          provide: ClickHouseService,
          useValue: { select: jest.fn().mockResolvedValue([{ total: 0 }]) },
        },
        {
          provide: BillingUsageCapService,
          useValue: {
            setSubscriptionItemHasReachedCap: jest
              .fn()
              .mockResolvedValue(undefined),
          },
        },
        {
          provide: CacheLockService,
          useValue: { withLock: jest.fn((fn: () => unknown) => fn()) },
        },
        {
          provide: CoreEntityCacheService,
          useValue: { get: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<BillingUsageService>(BillingUsageService);
    billingUsageCacheService = module.get(BillingUsageCacheService);
    billingCreditGrantService = module.get(BillingCreditGrantService);
    cacheLockService = module.get(CacheLockService);
    clickHouseService = module.get(ClickHouseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hasAvailableCredits', () => {
    it('answers from the warm counter without taking the lock', async () => {
      billingUsageCacheService.getAvailableCredits.mockResolvedValue(500);

      expect(await service.hasAvailableCredits(workspaceId)).toBe(true);
      expect(cacheLockService.withLock).not.toHaveBeenCalled();
      expect(clickHouseService.select).not.toHaveBeenCalled();
    });

    // Computing from the ledger and warming the counter are a read and a write
    // that a concurrent grant must not slip between, or the grant is counted
    // here and then added to the counter a second time.
    it('takes the credit state lock before computing a cold counter', async () => {
      expect(await service.hasAvailableCredits(workspaceId)).toBe(true);

      expect(cacheLockService.withLock).toHaveBeenCalledWith(
        expect.any(Function),
        `billing-credit-state:${workspaceId}`,
        expect.any(Object),
      );
      expect(billingUsageCacheService.warmAvailableCredits).toHaveBeenCalled();
    });

    it('skips the recompute when another reader warmed the counter first', async () => {
      billingUsageCacheService.getAvailableCredits
        .mockResolvedValueOnce(undefined)
        .mockResolvedValue(400);

      expect(await service.hasAvailableCredits(workspaceId)).toBe(true);
      expect(clickHouseService.select).not.toHaveBeenCalled();
      expect(
        billingUsageCacheService.warmAvailableCredits,
      ).not.toHaveBeenCalled();
    });

    // Blocking an execution because someone is writing a grant would be worse
    // than the double count the lock guards against.
    it('computes without the lock rather than failing when it cannot be acquired', async () => {
      cacheLockService.withLock.mockRejectedValue(
        new CacheLockException(
          'Failed to acquire lock',
          CacheLockExceptionCode.LOCK_ACQUISITION_TIMEOUT,
        ),
      );

      expect(await service.hasAvailableCredits(workspaceId)).toBe(true);
      expect(billingUsageCacheService.warmAvailableCredits).toHaveBeenCalled();
    });

    it('propagates failures that are not a lock timeout', async () => {
      cacheLockService.withLock.mockRejectedValue(new Error('redis is down'));

      await expect(service.hasAvailableCredits(workspaceId)).rejects.toThrow(
        'redis is down',
      );
    });
  });

  describe('decrementAvailableCreditsInCache', () => {
    it('decrements the warm counter without taking the lock', async () => {
      billingUsageCacheService.getAvailableCredits.mockResolvedValue(500);
      billingUsageCacheService.adjustAvailableCredits.mockResolvedValue(300);

      expect(
        await service.decrementAvailableCreditsInCache({
          workspaceId,
          usedCredits: 200,
        }),
      ).toBe(300);
      expect(cacheLockService.withLock).not.toHaveBeenCalled();
    });

    // Incrementing an absent key would install -usedCredits as the whole
    // balance, so a counter the stale marker refuses to warm is only computed.
    it('subtracts locally when the counter could not be warmed', async () => {
      billingCreditGrantService.getSpendableCreditsMicro.mockResolvedValue(0);
      billingUsageCacheService.warmAvailableCredits.mockResolvedValue(false);

      expect(
        await service.decrementAvailableCreditsInCache({
          workspaceId,
          usedCredits: 200,
        }),
      ).toBe(ALLOWANCE - 200);
      expect(
        billingUsageCacheService.adjustAvailableCredits,
      ).not.toHaveBeenCalled();
    });
  });
});
