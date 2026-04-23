/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
import { StripeBillingAlertService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-alert.service';
import { StripeCreditGrantService } from 'src/engine/core-modules/billing/stripe/services/stripe-credit-grant.service';

describe('MeteredCreditService', () => {
  let service: MeteredCreditService;
  let billingSubscriptionRepository: jest.Mocked<any>;
  let billingSubscriptionItemService: jest.Mocked<BillingSubscriptionItemService>;
  let stripeBillingAlertService: jest.Mocked<StripeBillingAlertService>;
  let stripeCreditGrantService: jest.Mocked<StripeCreditGrantService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeteredCreditService,
        {
          provide: getRepositoryToken(BillingSubscriptionEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingPriceEntity),
          useValue: {
            findOneOrFail: jest.fn(),
          },
        },
        {
          provide: BillingSubscriptionItemService,
          useValue: {
            getMeteredSubscriptionItemDetails: jest.fn(),
          },
        },
        {
          provide: StripeBillingAlertService,
          useValue: {
            createUsageThresholdAlertForCustomerMeter: jest.fn(),
          },
        },
        {
          provide: StripeCreditGrantService,
          useValue: {
            getCustomerCreditBalance: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MeteredCreditService>(MeteredCreditService);
    billingSubscriptionRepository = module.get(
      getRepositoryToken(BillingSubscriptionEntity),
    );
    billingSubscriptionItemService = module.get(BillingSubscriptionItemService);
    stripeBillingAlertService = module.get(StripeBillingAlertService);
    stripeCreditGrantService = module.get(StripeCreditGrantService);
  });

  describe('getMeteredPricingInfo', () => {
    const createMockSubscription = (meteredTiers: any[] | null = null) => ({
      id: 'sub_123',
      billingSubscriptionItems: [
        {
          stripePriceId: 'price_123',
          billingProduct: {
            metadata: { productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION },
            billingPrices: [
              {
                stripePriceId: 'price_123',
                stripeMeterId: 'meter_123',
                tiers: meteredTiers ?? [
                  {
                    up_to: 1000,
                    flat_amount: null,
                    unit_amount: null,
                    unit_amount_decimal: null,
                  },
                  {
                    up_to: null,
                    flat_amount: null,
                    unit_amount: null,
                    unit_amount_decimal: '10',
                  },
                ],
              },
            ],
          },
        },
      ],
    });

    it('should return pricing info when subscription and metered item found', async () => {
      const mockSubscription = createMockSubscription();

      billingSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);

      const result = await service.getMeteredPricingInfo('sub_123');

      expect(result).toEqual({
        tierCap: 1000,
        unitPriceCents: 10,
        stripeMeterId: 'meter_123',
      });
    });

    it('should return null when subscription not found', async () => {
      billingSubscriptionRepository.findOne.mockResolvedValue(null);

      const result = await service.getMeteredPricingInfo('sub_123');

      expect(result).toBeNull();
    });

    it('should return null when metered item not found', async () => {
      const mockSubscription = {
        id: 'sub_123',
        billingSubscriptionItems: [
          {
            billingProduct: {
              metadata: { productKey: 'other_product' },
              billingPrices: [],
            },
          },
        ],
      };

      billingSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);

      const result = await service.getMeteredPricingInfo('sub_123');

      expect(result).toBeNull();
    });
  });

  describe('getMeteredRolloverParameters', () => {
    it('should return parameters when metered item found', async () => {
      billingSubscriptionItemService.getMeteredSubscriptionItemDetails.mockResolvedValue(
        [
          {
            stripeSubscriptionItemId: 'si_123',
            productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
            stripeMeterId: 'meter_123',
            tierQuantity: 5000,
            unitPriceCents: 5,
            freeTrialQuantity: 100,
          },
        ],
      );

      const result = await service.getMeteredRolloverParameters('sub_123');

      expect(result).toEqual({
        stripeMeterId: 'meter_123',
        tierQuantity: 5000,
        unitPriceCents: 5,
      });
    });

    it('should return null when metered item not found', async () => {
      billingSubscriptionItemService.getMeteredSubscriptionItemDetails.mockResolvedValue(
        [],
      );

      const result = await service.getMeteredRolloverParameters('sub_123');

      expect(result).toBeNull();
    });
  });

  describe('recreateBillingAlertForSubscription', () => {
    it('should create billing alert with correct parameters', async () => {
      const currentPeriodStart = new Date('2024-01-01');
      const mockSubscription = {
        id: 'sub_123',
        stripeCustomerId: 'cus_123',
        currentPeriodStart,
        status: SubscriptionStatus.Active,
        billingSubscriptionItems: [
          {
            stripePriceId: 'price_123',
            billingProduct: {
              metadata: {
                productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
              },
              billingPrices: [
                {
                  stripePriceId: 'price_123',
                  stripeMeterId: 'meter_123',
                  tiers: [
                    {
                      up_to: 1000,
                      flat_amount: null,
                      unit_amount: null,
                      unit_amount_decimal: null,
                    },
                    {
                      up_to: null,
                      flat_amount: null,
                      unit_amount: null,
                      unit_amount_decimal: '10',
                    },
                  ],
                },
              ],
            },
          },
        ],
      };

      // Mock for getMeteredPricingInfo (uses findOne)
      billingSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      stripeCreditGrantService.getCustomerCreditBalance.mockResolvedValue(500);

      await service.recreateBillingAlertForSubscription(
        mockSubscription as any,
      );

      expect(
        stripeBillingAlertService.createUsageThresholdAlertForCustomerMeter,
      ).toHaveBeenCalledWith('cus_123', 1000, 500, currentPeriodStart);
    });

    it('should not create alert when metered pricing info not found', async () => {
      const mockSubscription = {
        id: 'sub_123',
        stripeCustomerId: 'cus_123',
        currentPeriodStart: new Date('2024-01-01'),
        status: SubscriptionStatus.Active,
        billingSubscriptionItems: [],
      };

      billingSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);

      await service.recreateBillingAlertForSubscription(
        mockSubscription as any,
      );

      expect(
        stripeBillingAlertService.createUsageThresholdAlertForCustomerMeter,
      ).not.toHaveBeenCalled();
    });
  });
});
