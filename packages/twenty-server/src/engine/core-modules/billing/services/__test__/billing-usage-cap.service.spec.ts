/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import {
  type BillingCapEvaluation,
  BillingUsageCapService,
} from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
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
            getMeteredPricingInfo: jest.fn(),
            getCreditBalance: jest.fn(),
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

  describe('getCurrentPeriodCreditsUsed', () => {
    beforeEach(() => {
      twentyConfigService.get.mockReturnValue('http://clickhouse:8123');
    });

    it('returns 0 when ClickHouse is disabled', async () => {
      twentyConfigService.get.mockReturnValue('');

      const result = await service.getCurrentPeriodCreditsUsed(
        'workspace_123',
        new Date('2026-04-01T00:00:00Z'),
        new Date('2026-05-01T00:00:00Z'),
      );

      expect(result).toBe(0);
      expect(clickHouseService.select).not.toHaveBeenCalled();
    });

    it('sums creditsUsedMicro for the workspace in the given period', async () => {
      clickHouseService.select.mockResolvedValue([{ total: 12345 }]);

      const result = await service.getCurrentPeriodCreditsUsed(
        'workspace_123',
        new Date('2026-04-01T00:00:00Z'),
        new Date('2026-05-01T00:00:00Z'),
      );

      expect(result).toBe(12345);
      expect(clickHouseService.select).toHaveBeenCalledTimes(1);

      const [query, params] = clickHouseService.select.mock.calls[0];

      expect(query).toContain('sum(creditsUsedMicro)');
      expect(query).toContain('FROM usageEvent');
      expect(params).toMatchObject({
        workspaceId: 'workspace_123',
        operationTypes: ['WORKFLOW_EXECUTION'],
      });
    });

    it('coerces string totals returned by ClickHouse to a number', async () => {
      clickHouseService.select.mockResolvedValue([{ total: '9876543210' }]);

      const result = await service.getCurrentPeriodCreditsUsed(
        'workspace_123',
        new Date('2026-04-01T00:00:00Z'),
        new Date('2026-05-01T00:00:00Z'),
      );

      expect(result).toBe(9876543210);
    });

    it('returns 0 when no rows are returned', async () => {
      clickHouseService.select.mockResolvedValue([]);

      const result = await service.getCurrentPeriodCreditsUsed(
        'workspace_123',
        new Date('2026-04-01T00:00:00Z'),
        new Date('2026-05-01T00:00:00Z'),
      );

      expect(result).toBe(0);
    });

    it('returns 0 when total is null', async () => {
      clickHouseService.select.mockResolvedValue([{ total: null }]);

      const result = await service.getCurrentPeriodCreditsUsed(
        'workspace_123',
        new Date('2026-04-01T00:00:00Z'),
        new Date('2026-05-01T00:00:00Z'),
      );

      expect(result).toBe(0);
    });
  });

  describe('evaluateCap', () => {
    beforeEach(() => {
      twentyConfigService.get.mockReturnValue('http://clickhouse:8123');
    });

    it('returns skipped when ClickHouse is disabled', async () => {
      twentyConfigService.get.mockReturnValue('');

      const result = await service.evaluateCap(buildSubscription());

      expect(result).toEqual<BillingCapEvaluation>({
        hasReachedCap: false,
        skipped: true,
        reason: 'clickhouse-disabled',
      });
      expect(meteredCreditService.getMeteredPricingInfo).not.toHaveBeenCalled();
    });

    it('returns skipped when subscription has no metered item', async () => {
      meteredCreditService.getMeteredPricingInfo.mockResolvedValue(null);

      const result = await service.evaluateCap(buildSubscription());

      expect(result).toEqual<BillingCapEvaluation>({
        hasReachedCap: false,
        skipped: true,
        reason: 'no-metered-item',
      });
      expect(clickHouseService.select).not.toHaveBeenCalled();
    });

    it('reports hasReachedCap=false when usage is below tierCap + creditBalance', async () => {
      meteredCreditService.getMeteredPricingInfo.mockResolvedValue({
        tierCap: 1_000_000,
        unitPriceCents: 10,
      });
      meteredCreditService.getCreditBalance.mockResolvedValue(250_000);
      clickHouseService.select.mockResolvedValue([{ total: 800_000 }]);

      const result = await service.evaluateCap(buildSubscription());

      expect(result).toEqual({
        hasReachedCap: false,
        usage: 800_000,
        allowance: 1_250_000,
        tierCap: 1_000_000,
        creditBalance: 250_000,
      });
    });

    it('reports hasReachedCap=true when usage meets tierCap + creditBalance', async () => {
      meteredCreditService.getMeteredPricingInfo.mockResolvedValue({
        tierCap: 1_000_000,
        unitPriceCents: 10,
      });
      meteredCreditService.getCreditBalance.mockResolvedValue(0);
      clickHouseService.select.mockResolvedValue([{ total: 1_000_000 }]);

      const result = await service.evaluateCap(buildSubscription());

      expect(result).toMatchObject({
        hasReachedCap: true,
        usage: 1_000_000,
        allowance: 1_000_000,
      });
    });

    it('reports hasReachedCap=true when usage exceeds tierCap + creditBalance', async () => {
      meteredCreditService.getMeteredPricingInfo.mockResolvedValue({
        tierCap: 1_000_000,
        unitPriceCents: 10,
      });
      meteredCreditService.getCreditBalance.mockResolvedValue(100_000);
      clickHouseService.select.mockResolvedValue([{ total: 5_000_000 }]);

      const result = await service.evaluateCap(buildSubscription());

      expect(result).toMatchObject({
        hasReachedCap: true,
        usage: 5_000_000,
        allowance: 1_100_000,
      });
    });

    it('re-reads pricing on each call so that tier changes apply immediately', async () => {
      meteredCreditService.getMeteredPricingInfo
        .mockResolvedValueOnce({ tierCap: 2_000_000, unitPriceCents: 10 })
        .mockResolvedValueOnce({ tierCap: 500_000, unitPriceCents: 10 });
      meteredCreditService.getCreditBalance.mockResolvedValue(0);
      clickHouseService.select.mockResolvedValue([{ total: 1_000_000 }]);

      const first = await service.evaluateCap(buildSubscription());
      const second = await service.evaluateCap(buildSubscription());

      expect(first).toMatchObject({ hasReachedCap: false, allowance: 2_000_000 });
      expect(second).toMatchObject({ hasReachedCap: true, allowance: 500_000 });
    });
  });
});
