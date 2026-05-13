/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { ResourceCreditService } from 'src/engine/core-modules/billing/services/resource-credit.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('BillingUsageCapService', () => {
  let service: BillingUsageCapService;
  let clickHouseService: jest.Mocked<ClickHouseService>;
  let twentyConfigService: jest.Mocked<TwentyConfigService>;

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
          provide: ResourceCreditService,
          useValue: {
            extractResourceCreditPricingInfo: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
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
});
