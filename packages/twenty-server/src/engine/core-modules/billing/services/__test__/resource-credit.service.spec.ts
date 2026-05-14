/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { ResourceCreditService } from 'src/engine/core-modules/billing/services/resource-credit.service';

describe('ResourceCreditService', () => {
  let service: ResourceCreditService;
  let billingSubscriptionRepository: jest.Mocked<any>;

  const buildSubscriptionWithResourceCredit = (
    creditAmount: number,
    unitAmount = 0,
  ) => ({
    id: 'sub_123',
    billingSubscriptionItems: [
      {
        stripePriceId: 'price_rc_123',
        billingProduct: {
          metadata: { productKey: BillingProductKey.RESOURCE_CREDIT },
          billingPrices: [
            {
              stripePriceId: 'price_rc_123',
              metadata: { credit_amount: String(creditAmount) },
              unitAmount,
            },
          ],
        },
      },
    ],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceCreditService,
        {
          provide: getRepositoryToken(BillingSubscriptionEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingPriceEntity),
          useValue: {
            findOneOrFail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResourceCreditService>(ResourceCreditService);
    billingSubscriptionRepository = module.get(
      getRepositoryToken(BillingSubscriptionEntity),
    );
  });

  describe('extractResourceCreditPricingInfo', () => {
    it('returns pricing info for a valid resource credit subscription', () => {
      const subscription = buildSubscriptionWithResourceCredit(1000, 10);

      const result = service.extractResourceCreditPricingInfo(
        subscription as any,
      );

      expect(result).toEqual({ tierCap: 1000, unitPriceCents: 10 });
    });

    it('returns null when no RESOURCE_CREDIT item found', () => {
      const subscription = {
        billingSubscriptionItems: [
          {
            stripePriceId: 'price_base',
            billingProduct: {
              metadata: { productKey: BillingProductKey.BASE_PRODUCT },
              billingPrices: [],
            },
          },
        ],
      };

      expect(
        service.extractResourceCreditPricingInfo(subscription as any),
      ).toBeNull();
    });

    it('returns null when credit_amount is 0', () => {
      const subscription = buildSubscriptionWithResourceCredit(0);

      expect(
        service.extractResourceCreditPricingInfo(subscription as any),
      ).toBeNull();
    });

    it('returns null when matching price not found', () => {
      const subscription = {
        billingSubscriptionItems: [
          {
            stripePriceId: 'price_rc_different',
            billingProduct: {
              metadata: { productKey: BillingProductKey.RESOURCE_CREDIT },
              billingPrices: [
                {
                  stripePriceId: 'price_rc_other',
                  metadata: { credit_amount: '500' },
                },
              ],
            },
          },
        ],
      };

      expect(
        service.extractResourceCreditPricingInfo(subscription as any),
      ).toBeNull();
    });
  });

  describe('getResourceCreditRolloverParameters', () => {
    it('returns parameters when resource credit item found', async () => {
      const subscription = buildSubscriptionWithResourceCredit(5000, 5);

      billingSubscriptionRepository.findOne.mockResolvedValue(subscription);

      const result =
        await service.getResourceCreditRolloverParameters('sub_123');

      expect(result).toEqual({ tierQuantity: 5000, unitPriceCents: 5 });
    });

    it('returns null when subscription not found', async () => {
      billingSubscriptionRepository.findOne.mockResolvedValue(null);

      const result =
        await service.getResourceCreditRolloverParameters('sub_123');

      expect(result).toBeNull();
    });

    it('returns null when resource credit pricing info not extractable', async () => {
      billingSubscriptionRepository.findOne.mockResolvedValue({
        billingSubscriptionItems: [],
      });

      const result =
        await service.getResourceCreditRolloverParameters('sub_123');

      expect(result).toBeNull();
    });
  });
});
