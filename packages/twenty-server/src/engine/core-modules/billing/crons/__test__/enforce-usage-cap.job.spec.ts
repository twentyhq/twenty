/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EnforceUsageCapJob } from 'src/engine/core-modules/billing/crons/enforce-usage-cap.job';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('EnforceUsageCapJob', () => {
  let job: EnforceUsageCapJob;
  let billingSubscriptionRepository: jest.Mocked<{
    find: jest.Mock;
  }>;
  let billingSubscriptionItemRepository: jest.Mocked<{
    update: jest.Mock;
  }>;
  let billingUsageCapService: jest.Mocked<BillingUsageCapService>;
  let twentyConfigService: jest.Mocked<TwentyConfigService>;

  const buildSubscription = ({
    id = 'sub_123',
    workspaceId = 'workspace_123',
    itemId = 'item_123',
    hasReachedCurrentPeriodCap = false,
  } = {}) =>
    ({
      id,
      workspaceId,
      stripeCustomerId: 'cus_123',
      currentPeriodStart: new Date('2026-04-01T00:00:00Z'),
      currentPeriodEnd: new Date('2026-05-01T00:00:00Z'),
      billingSubscriptionItems: [
        {
          id: itemId,
          hasReachedCurrentPeriodCap,
          billingProduct: {
            metadata: {
              productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
            },
          },
        },
      ],
    }) as unknown as BillingSubscriptionEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnforceUsageCapJob,
        {
          provide: getRepositoryToken(BillingSubscriptionEntity),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingSubscriptionItemEntity),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: BillingUsageCapService,
          useValue: {
            isClickHouseEnabled: jest.fn().mockReturnValue(true),
            evaluateCap: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    job = module.get<EnforceUsageCapJob>(EnforceUsageCapJob);
    billingSubscriptionRepository = module.get(
      getRepositoryToken(BillingSubscriptionEntity),
    );
    billingSubscriptionItemRepository = module.get(
      getRepositoryToken(BillingSubscriptionItemEntity),
    );
    billingUsageCapService = module.get(BillingUsageCapService);
    twentyConfigService = module.get(TwentyConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockConfig = (overrides: Record<string, unknown> = {}) => {
    const values: Record<string, unknown> = {
      IS_BILLING_ENABLED: true,
      BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: false,
      ...overrides,
    };

    twentyConfigService.get.mockImplementation(
      (key: string) => values[key] as never,
    );
  };

  it('no-ops when billing is disabled', async () => {
    mockConfig({ IS_BILLING_ENABLED: false });

    await job.handle();

    expect(billingSubscriptionRepository.find).not.toHaveBeenCalled();
  });

  it('no-ops when ClickHouse is not configured', async () => {
    mockConfig();
    billingUsageCapService.isClickHouseEnabled.mockReturnValue(false);

    await job.handle();

    expect(billingSubscriptionRepository.find).not.toHaveBeenCalled();
  });

  it('skips transitions in shadow mode (flag off)', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: false });
    billingSubscriptionRepository.find.mockResolvedValue([
      buildSubscription({ hasReachedCurrentPeriodCap: false }),
    ]);
    billingUsageCapService.evaluateCap.mockResolvedValue({
      hasReachedCap: true,
      usage: 2_000_000,
      allowance: 1_000_000,
      tierCap: 1_000_000,
      creditBalance: 0,
    });

    await job.handle();

    expect(billingSubscriptionItemRepository.update).not.toHaveBeenCalled();
  });

  it('flips hasReachedCurrentPeriodCap=true in active mode when usage exceeds allowance', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    billingSubscriptionRepository.find.mockResolvedValue([
      buildSubscription({
        itemId: 'item_123',
        hasReachedCurrentPeriodCap: false,
      }),
    ]);
    billingUsageCapService.evaluateCap.mockResolvedValue({
      hasReachedCap: true,
      usage: 2_000_000,
      allowance: 1_000_000,
      tierCap: 1_000_000,
      creditBalance: 0,
    });

    await job.handle();

    expect(billingSubscriptionItemRepository.update).toHaveBeenCalledWith(
      { id: 'item_123' },
      { hasReachedCurrentPeriodCap: true },
    );
  });

  it('flips hasReachedCurrentPeriodCap=false in active mode when usage drops below allowance', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    billingSubscriptionRepository.find.mockResolvedValue([
      buildSubscription({
        itemId: 'item_123',
        hasReachedCurrentPeriodCap: true,
      }),
    ]);
    billingUsageCapService.evaluateCap.mockResolvedValue({
      hasReachedCap: false,
      usage: 500_000,
      allowance: 1_000_000,
      tierCap: 1_000_000,
      creditBalance: 0,
    });

    await job.handle();

    expect(billingSubscriptionItemRepository.update).toHaveBeenCalledWith(
      { id: 'item_123' },
      { hasReachedCurrentPeriodCap: false },
    );
  });

  it('does not update when state already matches', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    billingSubscriptionRepository.find.mockResolvedValue([
      buildSubscription({ hasReachedCurrentPeriodCap: true }),
    ]);
    billingUsageCapService.evaluateCap.mockResolvedValue({
      hasReachedCap: true,
      usage: 2_000_000,
      allowance: 1_000_000,
      tierCap: 1_000_000,
      creditBalance: 0,
    });

    await job.handle();

    expect(billingSubscriptionItemRepository.update).not.toHaveBeenCalled();
  });

  it('skips subscriptions without a metered item', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    billingSubscriptionRepository.find.mockResolvedValue([
      buildSubscription(),
    ]);
    billingUsageCapService.evaluateCap.mockResolvedValue({
      hasReachedCap: false,
      skipped: true,
      reason: 'no-metered-item',
    });

    await job.handle();

    expect(billingSubscriptionItemRepository.update).not.toHaveBeenCalled();
  });

  it('continues processing after a per-subscription error', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    billingSubscriptionRepository.find.mockResolvedValue([
      buildSubscription({ id: 'sub_1', itemId: 'item_1' }),
      buildSubscription({ id: 'sub_2', itemId: 'item_2' }),
    ]);
    billingUsageCapService.evaluateCap
      .mockRejectedValueOnce(new Error('clickhouse exploded'))
      .mockResolvedValueOnce({
        hasReachedCap: true,
        usage: 2_000_000,
        allowance: 1_000_000,
        tierCap: 1_000_000,
        creditBalance: 0,
      });

    await job.handle();

    expect(billingSubscriptionItemRepository.update).toHaveBeenCalledTimes(1);
    expect(billingSubscriptionItemRepository.update).toHaveBeenCalledWith(
      { id: 'item_2' },
      { hasReachedCurrentPeriodCap: true },
    );
  });
});
