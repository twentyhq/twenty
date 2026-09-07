import { DiscoveryService } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import {
  WorkspaceCacheException,
  WorkspaceCacheExceptionCode,
} from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';

const ALLOWANCE_PERIOD = {
  periodStart: new Date('2026-08-15T09:00:00.000Z'),
  periodEnd: new Date('2026-09-15T09:00:00.000Z'),
};

class TestCreditAllowanceProvider extends CreditAllowanceProvider {
  isCreditAllowanceEnabled = jest.fn().mockResolvedValue(true);
  getCreditAllowancePeriod = jest.fn().mockResolvedValue(null);
  getCreditAllowance = jest.fn().mockResolvedValue(null);
}

const buildLimit = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  limitValue: 1_000,
  burstValue: null,
  ...overrides,
});

describe('UsagePeriodService', () => {
  let service: UsagePeriodService;
  let creditAllowanceProvider: TestCreditAllowanceProvider;

  beforeEach(async () => {
    creditAllowanceProvider = new TestCreditAllowanceProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsagePeriodService,
        {
          provide: DiscoveryService,
          useValue: {
            getProviders: () => [{ instance: creditAllowanceProvider }],
          },
        },
      ],
    }).compile();

    service = module.get<UsagePeriodService>(UsagePeriodService);
    service.onModuleInit();
  });

  describe('findCurrentPeriod', () => {
    it('returns the calendar period containing now', async () => {
      const now = Date.now();
      const period = await service.findCurrentPeriod({
        workspaceId: 'workspace-1',
        periodUnit: 'month',
      });

      expect(period?.periodStart.getTime()).toBeLessThanOrEqual(now);
      expect(period?.periodEnd.getTime()).toBeGreaterThan(now);
    });

    it('returns the allowance period from the provider', async () => {
      creditAllowanceProvider.getCreditAllowancePeriod.mockResolvedValue(
        ALLOWANCE_PERIOD,
      );

      await expect(
        service.findCurrentPeriod({
          workspaceId: 'workspace-1',
          periodUnit: 'allowancePeriod',
        }),
      ).resolves.toEqual(ALLOWANCE_PERIOD);
    });

    it('returns null when the provider has no period', async () => {
      await expect(
        service.findCurrentPeriod({
          workspaceId: 'workspace-1',
          periodUnit: 'allowancePeriod',
        }),
      ).resolves.toBeNull();
    });

    it('returns null when the billing lookup fails', async () => {
      creditAllowanceProvider.getCreditAllowancePeriod.mockRejectedValue(
        new Error('billing down'),
      );

      await expect(
        service.findCurrentPeriod({
          workspaceId: 'workspace-1',
          periodUnit: 'allowancePeriod',
        }),
      ).resolves.toBeNull();
    });

    it('rethrows a workspace cache failure', async () => {
      creditAllowanceProvider.getCreditAllowancePeriod.mockRejectedValue(
        new WorkspaceCacheException(
          'cache down',
          WorkspaceCacheExceptionCode.INVALID_PARAMETERS,
        ),
      );

      await expect(
        service.findCurrentPeriod({
          workspaceId: 'workspace-1',
          periodUnit: 'allowancePeriod',
        }),
      ).rejects.toBeInstanceOf(WorkspaceCacheException);
    });
  });

  describe('findCurrentPeriodsByUnit', () => {
    it('resolves each anchored unit once and skips units without a period', async () => {
      const periodByUnit = await service.findCurrentPeriodsByUnit({
        workspaceId: 'workspace-1',
        limits: [
          buildLimit({ id: 'month-1' }),
          buildLimit({ id: 'month-2', spenderType: 'userWorkspace' }),
          buildLimit({ id: 'allowance', periodUnit: 'allowancePeriod' }),
          buildLimit({
            id: 'speed',
            limitKind: 'speed',
            periodUnit: 'second',
            meter: 'quantity',
          }),
        ],
      });

      expect(Object.keys(periodByUnit)).toEqual(['month']);
      expect(
        creditAllowanceProvider.getCreditAllowancePeriod,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
