/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In } from 'typeorm';

import { EnforceUsageCapJob } from 'src/engine/core-modules/billing/crons/enforce-usage-cap.job';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('EnforceUsageCapJob', () => {
  let job: EnforceUsageCapJob;
  let getManyMock: jest.Mock;
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
    stripeCustomerId = 'cus_123',
    creditBalanceMicro = 0,
  } = {}) =>
    ({
      id,
      workspaceId,
      stripeCustomerId,
      currentPeriodStart: new Date('2026-04-01T00:00:00Z'),
      currentPeriodEnd: new Date('2026-05-01T00:00:00Z'),
      billingCustomer: {
        stripeCustomerId,
        creditBalanceMicro,
      },
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
    getManyMock = jest.fn().mockResolvedValue([]);

    const queryBuilderMock = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: getManyMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnforceUsageCapJob,
        {
          provide: getRepositoryToken(BillingSubscriptionEntity),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
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
            getBatchPeriodCreditsUsed: jest.fn().mockResolvedValue(new Map()),
            evaluateCapBatch: jest.fn().mockReturnValue(new Map()),
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

    expect(getManyMock).not.toHaveBeenCalled();
  });

  it('no-ops when ClickHouse is not configured', async () => {
    mockConfig();
    billingUsageCapService.isClickHouseEnabled.mockReturnValue(false);

    await job.handle();

    expect(getManyMock).not.toHaveBeenCalled();
  });

  it('skips transitions in shadow mode (flag off)', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: false });
    const sub = buildSubscription({ hasReachedCurrentPeriodCap: false });

    getManyMock.mockResolvedValueOnce([sub]);

    billingUsageCapService.getBatchPeriodCreditsUsed.mockResolvedValue(
      new Map([['workspace_123', 2_000_000]]),
    );
    billingUsageCapService.evaluateCapBatch.mockReturnValue(
      new Map([
        [
          'sub_123',
          {
            skipped: false as const,
            hasReachedCap: true,
            usage: 2_000_000,
            allowance: 1_000_000,
            tierCap: 1_000_000,
            creditBalance: 0,
          },
        ],
      ]),
    );

    await job.handle();

    expect(billingSubscriptionItemRepository.update).not.toHaveBeenCalled();
  });

  it('batch-updates hasReachedCurrentPeriodCap=true in active mode when usage exceeds allowance', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    const sub = buildSubscription({
      itemId: 'item_123',
      hasReachedCurrentPeriodCap: false,
    });

    getManyMock.mockResolvedValueOnce([sub]);

    billingUsageCapService.getBatchPeriodCreditsUsed.mockResolvedValue(
      new Map([['workspace_123', 2_000_000]]),
    );
    billingUsageCapService.evaluateCapBatch.mockReturnValue(
      new Map([
        [
          'sub_123',
          {
            skipped: false as const,
            hasReachedCap: true,
            usage: 2_000_000,
            allowance: 1_000_000,
            tierCap: 1_000_000,
            creditBalance: 0,
          },
        ],
      ]),
    );

    await job.handle();

    expect(billingSubscriptionItemRepository.update).toHaveBeenCalledWith(
      { id: In(['item_123']) },
      { hasReachedCurrentPeriodCap: true },
    );
  });

  it('batch-updates hasReachedCurrentPeriodCap=false in active mode when usage drops below allowance', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    const sub = buildSubscription({
      itemId: 'item_123',
      hasReachedCurrentPeriodCap: true,
    });

    getManyMock.mockResolvedValueOnce([sub]);

    billingUsageCapService.getBatchPeriodCreditsUsed.mockResolvedValue(
      new Map([['workspace_123', 500_000]]),
    );
    billingUsageCapService.evaluateCapBatch.mockReturnValue(
      new Map([
        [
          'sub_123',
          {
            skipped: false as const,
            hasReachedCap: false,
            usage: 500_000,
            allowance: 1_000_000,
            tierCap: 1_000_000,
            creditBalance: 0,
          },
        ],
      ]),
    );

    await job.handle();

    expect(billingSubscriptionItemRepository.update).toHaveBeenCalledWith(
      { id: In(['item_123']) },
      { hasReachedCurrentPeriodCap: false },
    );
  });

  it('does not update when state already matches', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    const sub = buildSubscription({ hasReachedCurrentPeriodCap: true });

    getManyMock.mockResolvedValueOnce([sub]);

    billingUsageCapService.getBatchPeriodCreditsUsed.mockResolvedValue(
      new Map([['workspace_123', 2_000_000]]),
    );
    billingUsageCapService.evaluateCapBatch.mockReturnValue(
      new Map([
        [
          'sub_123',
          {
            skipped: false as const,
            hasReachedCap: true,
            usage: 2_000_000,
            allowance: 1_000_000,
            tierCap: 1_000_000,
            creditBalance: 0,
          },
        ],
      ]),
    );

    await job.handle();

    expect(billingSubscriptionItemRepository.update).not.toHaveBeenCalled();
  });

  it('skips subscriptions without a metered item', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    const sub = buildSubscription();

    getManyMock.mockResolvedValueOnce([sub]);

    billingUsageCapService.getBatchPeriodCreditsUsed.mockResolvedValue(
      new Map(),
    );
    billingUsageCapService.evaluateCapBatch.mockReturnValue(
      new Map([
        [
          'sub_123',
          { skipped: true as const, reason: 'no-metered-item' as const },
        ],
      ]),
    );

    await job.handle();

    expect(billingSubscriptionItemRepository.update).not.toHaveBeenCalled();
  });

  it('passes credit balance from billingCustomer to evaluateCapBatch', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    const sub = buildSubscription({
      stripeCustomerId: 'cus_456',
      creditBalanceMicro: 300_000,
    });

    getManyMock.mockResolvedValueOnce([sub]);

    billingUsageCapService.getBatchPeriodCreditsUsed.mockResolvedValue(
      new Map(),
    );
    billingUsageCapService.evaluateCapBatch.mockReturnValue(new Map());

    await job.handle();

    expect(billingUsageCapService.evaluateCapBatch).toHaveBeenCalledWith(
      [sub],
      expect.any(Map),
      new Map([['cus_456', 300_000]]),
    );
  });

  it('handles ClickHouse batch query errors gracefully', async () => {
    mockConfig({ BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: true });
    const sub = buildSubscription();

    getManyMock.mockResolvedValueOnce([sub]);

    billingUsageCapService.getBatchPeriodCreditsUsed.mockRejectedValue(
      new Error('clickhouse exploded'),
    );
    billingUsageCapService.evaluateCapBatch.mockReturnValue(new Map());

    await expect(job.handle()).resolves.not.toThrow();
  });
});
