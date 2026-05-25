/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingCreditRolloverService } from 'src/engine/core-modules/billing/services/billing-credit-rollover.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';

describe('BillingCreditRolloverService', () => {
  let service: BillingCreditRolloverService;
  let billingUsageService: jest.Mocked<
    Pick<BillingUsageService, 'getCurrentPeriodCreditsUsed'>
  >;
  let billingCustomerRepository: jest.Mocked<{ update: jest.Mock }>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingCreditRolloverService,
        {
          provide: BillingUsageService,
          useValue: {
            getCurrentPeriodCreditsUsed: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: getRepositoryToken(BillingCustomerEntity),
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingCreditRolloverService>(
      BillingCreditRolloverService,
    );
    billingUsageService = module.get(BillingUsageService);
    billingCustomerRepository = module.get(
      getRepositoryToken(BillingCustomerEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processRolloverOnPeriodTransition', () => {
    const baseParams = {
      workspaceId: 'ws_123',
      stripeCustomerId: 'cus_123',
      tierQuantity: 1000,
      previousPeriodStart: new Date('2024-01-01'),
    };

    it('writes rollover amount to creditBalanceMicro when credits unused', async () => {
      (
        billingUsageService.getCurrentPeriodCreditsUsed as jest.Mock
      ).mockResolvedValue(300);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(billingCustomerRepository.update).toHaveBeenCalledWith(
        { stripeCustomerId: 'cus_123' },
        { creditBalanceMicro: 700 },
      );
    });

    it('sets creditBalanceMicro to tierQuantity when no credits used', async () => {
      (
        billingUsageService.getCurrentPeriodCreditsUsed as jest.Mock
      ).mockResolvedValue(0);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(billingCustomerRepository.update).toHaveBeenCalledWith(
        { stripeCustomerId: 'cus_123' },
        { creditBalanceMicro: 1000 },
      );
    });

    it('sets creditBalanceMicro to 0 when all credits used', async () => {
      (
        billingUsageService.getCurrentPeriodCreditsUsed as jest.Mock
      ).mockResolvedValue(1000);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(billingCustomerRepository.update).toHaveBeenCalledWith(
        { stripeCustomerId: 'cus_123' },
        { creditBalanceMicro: 0 },
      );
    });

    it('sets creditBalanceMicro to 0 when usage exceeds tier', async () => {
      (
        billingUsageService.getCurrentPeriodCreditsUsed as jest.Mock
      ).mockResolvedValue(1500);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(billingCustomerRepository.update).toHaveBeenCalledWith(
        { stripeCustomerId: 'cus_123' },
        { creditBalanceMicro: 0 },
      );
    });

    it('caps rollover at tierQuantity', async () => {
      (
        billingUsageService.getCurrentPeriodCreditsUsed as jest.Mock
      ).mockResolvedValue(0);
      const params = { ...baseParams, tierQuantity: 500 };

      await service.processRolloverOnPeriodTransition(params);

      expect(billingCustomerRepository.update).toHaveBeenCalledWith(
        { stripeCustomerId: 'cus_123' },
        { creditBalanceMicro: 500 },
      );
    });
  });
});
