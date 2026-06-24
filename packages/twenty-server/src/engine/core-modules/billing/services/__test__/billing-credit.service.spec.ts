/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { BillingException } from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

describe('BillingCreditService', () => {
  let service: BillingCreditService;
  let billingService: jest.Mocked<Pick<BillingService, 'isBillingEnabled'>>;
  let billingUsageCacheService: jest.Mocked<
    Pick<BillingUsageCacheService, 'flushAvailableCredits'>
  >;
  let billingCustomerRepository: jest.Mocked<{ increment: jest.Mock }>;

  const workspaceId = 'ws_123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingCreditService,
        {
          provide: BillingService,
          useValue: {
            isBillingEnabled: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: BillingUsageCacheService,
          useValue: {
            flushAvailableCredits: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
          useValue: {
            increment: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<BillingCreditService>(BillingCreditService);
    billingService = module.get(BillingService);
    billingUsageCacheService = module.get(BillingUsageCacheService);
    billingCustomerRepository = module.get(
      getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('creditWorkspaceBalance', () => {
    it('increments the credit balance and flushes the usage cache', async () => {
      await service.creditWorkspaceBalance({
        workspaceId,
        amountMicro: 2_000_000,
      });

      expect(billingCustomerRepository.increment).toHaveBeenCalledWith(
        workspaceId,
        {},
        'creditBalanceMicro',
        2_000_000,
      );
      expect(
        billingUsageCacheService.flushAvailableCredits,
      ).toHaveBeenCalledWith(workspaceId);
    });

    it('no-ops when billing is disabled', async () => {
      billingService.isBillingEnabled.mockReturnValue(false);

      await service.creditWorkspaceBalance({
        workspaceId,
        amountMicro: 2_000_000,
      });

      expect(billingCustomerRepository.increment).not.toHaveBeenCalled();
      expect(
        billingUsageCacheService.flushAvailableCredits,
      ).not.toHaveBeenCalled();
    });

    it('does not flush the cache when no billing customer exists', async () => {
      billingCustomerRepository.increment.mockResolvedValue({ affected: 0 });

      await service.creditWorkspaceBalance({
        workspaceId,
        amountMicro: 2_000_000,
      });

      expect(billingCustomerRepository.increment).toHaveBeenCalled();
      expect(
        billingUsageCacheService.flushAvailableCredits,
      ).not.toHaveBeenCalled();
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
      'throws on a non-positive or non-finite amount (%p)',
      async (amountMicro) => {
        await expect(
          service.creditWorkspaceBalance({ workspaceId, amountMicro }),
        ).rejects.toThrow(BillingException);

        expect(billingCustomerRepository.increment).not.toHaveBeenCalled();
      },
    );
  });
});
