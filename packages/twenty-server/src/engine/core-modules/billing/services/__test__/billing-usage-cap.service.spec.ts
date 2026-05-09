/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('BillingUsageCapService', () => {
  let service: BillingUsageCapService;
  let clickHouseService: jest.Mocked<ClickHouseService>;
  let meteredCreditService: jest.Mocked<MeteredCreditService>;
  let twentyConfigService: jest.Mocked<TwentyConfigService>;

  const buildSubscription = (
    overrides: Partial<BillingSubscriptionEntity> = {},
  ): BillingSubscriptionEntity =>
    ({
      id: 'sub_123',
      workspaceId: 'workspace_123',
      stripeCustomerId: 'cus_123',
      currentPeriodStart: new Date('2026-04-01T00:00:00Z'),
      currentPeriodEnd: new Date('2026-05-01T00:00:00Z'),
      ...overrides,
    }) as BillingSubscriptionEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingUsageCapService,
        {
          provide: ClickHouseService,
          useValue: {
            select: jest.fn(),
          },
        },
        {
          provide: MeteredCreditService,
          useValue: {
            extractMeteredPricingInfoFromSubscription: jest.fn(),
            getCreditBalance: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: FeatureFlagService,
          useValue: {
            isFeatureEnabled: jest.fn().mockResolvedValue(false),
          },
        },
        {
          provide: getRepositoryToken(BillingSubscriptionItemEntity),
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingUsageCapService>(BillingUsageCapService);
    clickHouseService = module.get(ClickHouseService);
    meteredCreditService = module.get(MeteredCreditService);
    twentyConfigService = module.get(TwentyConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isClickHouseEnabled', () => {
    it('returns true when CLICKHOUSE_URL is configured', () => {
      twentyConfigService.get.mockReturnValue('http://clickhouse:8123');

      expect(service.isClickHouseEnabled()).toBe(true);
    });

    it('returns false when CLICKHOUSE_URL is empty', () => {
      twentyConfigService.get.mockReturnValue('');

      expect(service.isClickHouseEnabled()).toBe(false);
    });
  });

  describe('getBatchPeriodCreditsUsed', () => {
    beforeEach(() => {
      twentyConfigService.get.mockReturnValue('http://clickhouse:8123');
    });

    it('returns empty map when ClickHouse is disabled', async () => {
      twentyConfigService.get.mockReturnValue('');

      const result = await service.getBatchPeriodCreditsUsed(
        ['ws_1', 'ws_2'],
        new Date('2026-04-01T00:00:00Z'),
      );

      expect(result.size).toBe(0);
      expect(clickHouseService.select).not.toHaveBeenCalled();
    });

    it('returns empty map when workspaceIds is empty', async () => {
      const result = await service.getBatchPeriodCreditsUsed(
        [],
        new Date('2026-04-01T00:00:00Z'),
      );

      expect(result.size).toBe(0);
      expect(clickHouseService.select).not.toHaveBeenCalled();
    });

    it('returns usage grouped by workspaceId', async () => {
      clickHouseService.select.mockResolvedValue([
        { workspaceId: 'ws_1', total: 500_000 },
        { workspaceId: 'ws_2', total: 1_200_000 },
      ]);

      const result = await service.getBatchPeriodCreditsUsed(
        ['ws_1', 'ws_2', 'ws_3'],
        new Date('2026-04-01T00:00:00Z'),
      );

      expect(result.get('ws_1')).toBe(500_000);
      expect(result.get('ws_2')).toBe(1_200_000);
      expect(result.has('ws_3')).toBe(false);

      const [query, params] = clickHouseService.select.mock.calls[0];

      expect(query).toContain('GROUP BY workspaceId');
      expect(query).toContain('IN {workspaceIds:Array(String)}');
      expect(params).toMatchObject({
        workspaceIds: ['ws_1', 'ws_2', 'ws_3'],
      });
    });

    it('coerces string totals from ClickHouse', async () => {
      clickHouseService.select.mockResolvedValue([
        { workspaceId: 'ws_1', total: '9876543210' },
      ]);

      const result = await service.getBatchPeriodCreditsUsed(
        ['ws_1'],
        new Date('2026-04-01T00:00:00Z'),
      );

      expect(result.get('ws_1')).toBe(9876543210);
    });
  });

  describe('evaluateCapBatch', () => {
    it('returns evaluations keyed by subscription id', () => {
      meteredCreditService.extractMeteredPricingInfoFromSubscription.mockReturnValue(
        { tierCap: 1_000_000, unitPriceCents: 10 },
      );

      const sub1 = buildSubscription({
        id: 'sub_1',
        workspaceId: 'ws_1',
        stripeCustomerId: 'cus_1',
      });
      const sub2 = buildSubscription({
        id: 'sub_2',
        workspaceId: 'ws_2',
        stripeCustomerId: 'cus_2',
      });

      const usageByWorkspace = new Map([
        ['ws_1', 500_000],
        ['ws_2', 1_500_000],
      ]);
      const creditBalanceByCustomer = new Map([
        ['cus_1', 0],
        ['cus_2', 200_000],
      ]);

      const results = service.evaluateCapBatch(
        [sub1, sub2],
        usageByWorkspace,
        creditBalanceByCustomer,
      );

      expect(results.get('sub_1')).toMatchObject({
        skipped: false,
        hasReachedCap: false,
        usage: 500_000,
        allowance: 1_000_000,
      });
      expect(results.get('sub_2')).toMatchObject({
        skipped: false,
        hasReachedCap: true,
        usage: 1_500_000,
        allowance: 1_200_000,
      });
    });

    it('defaults usage to 0 for workspaces not in the map', () => {
      meteredCreditService.extractMeteredPricingInfoFromSubscription.mockReturnValue(
        { tierCap: 1_000_000, unitPriceCents: 10 },
      );

      const sub = buildSubscription({
        id: 'sub_1',
        workspaceId: 'ws_unknown',
        stripeCustomerId: 'cus_1',
      });

      const results = service.evaluateCapBatch(
        [sub],
        new Map(),
        new Map([['cus_1', 0]]),
      );

      expect(results.get('sub_1')).toMatchObject({
        skipped: false,
        hasReachedCap: false,
        usage: 0,
        allowance: 1_000_000,
      });
    });

    it('defaults credit balance to 0 for unknown customers', () => {
      meteredCreditService.extractMeteredPricingInfoFromSubscription.mockReturnValue(
        { tierCap: 1_000_000, unitPriceCents: 10 },
      );

      const sub = buildSubscription({
        id: 'sub_1',
        workspaceId: 'ws_1',
        stripeCustomerId: 'cus_unknown',
      });

      const results = service.evaluateCapBatch(
        [sub],
        new Map([['ws_1', 500_000]]),
        new Map(),
      );

      expect(results.get('sub_1')).toMatchObject({
        skipped: false,
        hasReachedCap: false,
        usage: 500_000,
        creditBalance: 0,
        allowance: 1_000_000,
      });
    });

    it('returns skipped for subscriptions without metered pricing', () => {
      meteredCreditService.extractMeteredPricingInfoFromSubscription.mockReturnValue(
        null,
      );

      const sub = buildSubscription({ id: 'sub_1' });

      const results = service.evaluateCapBatch([sub], new Map(), new Map());

      expect(results.get('sub_1')).toEqual({
        skipped: true,
        reason: 'no-metered-item',
      });
    });
  });
});
