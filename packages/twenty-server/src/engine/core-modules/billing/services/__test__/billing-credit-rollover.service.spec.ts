/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import type Stripe from 'stripe';

import { BillingCreditRolloverService } from 'src/engine/core-modules/billing/services/billing-credit-rollover.service';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { StripeCreditGrantService } from 'src/engine/core-modules/billing/stripe/services/stripe-credit-grant.service';

describe('BillingCreditRolloverService', () => {
  let service: BillingCreditRolloverService;
  let stripeCreditGrantService: jest.Mocked<StripeCreditGrantService>;
  let stripeBillingMeterEventService: jest.Mocked<StripeBillingMeterEventService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingCreditRolloverService,
        {
          provide: StripeCreditGrantService,
          useValue: {
            createCreditGrant: jest.fn(),
            listCreditGrants: jest.fn().mockResolvedValue([]),
            voidCreditGrant: jest.fn(),
          },
        },
        {
          provide: StripeBillingMeterEventService,
          useValue: {
            sumMeterEvents: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingCreditRolloverService>(
      BillingCreditRolloverService,
    );
    stripeCreditGrantService = module.get(StripeCreditGrantService);
    stripeBillingMeterEventService = module.get(StripeBillingMeterEventService);
  });

  describe('processRolloverOnPeriodTransition', () => {
    const baseParams = {
      stripeCustomerId: 'cus_123',
      subscriptionId: 'sub_123',
      stripeMeterId: 'meter_123',
      previousPeriodStart: new Date('2024-01-01'),
      previousPeriodEnd: new Date('2024-02-01'),
      newPeriodEnd: new Date('2024-03-01'),
      tierQuantity: 1000,
      unitPriceCents: 10,
    };

    it('should create rollover grant for unused credits', async () => {
      stripeBillingMeterEventService.sumMeterEvents.mockResolvedValue(300);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(stripeCreditGrantService.createCreditGrant).toHaveBeenCalledWith({
        customerId: 'cus_123',
        creditUnits: 700, // 1000 - 300 = 700 unused
        unitPriceCents: 10,
        expiresAt: baseParams.newPeriodEnd,
        metadata: {
          type: 'rollover',
          fromPeriodStart: baseParams.previousPeriodStart.toISOString(),
          fromPeriodEnd: baseParams.previousPeriodEnd.toISOString(),
          subscriptionId: 'sub_123',
        },
      });
    });

    it('should cap rollover at tier quantity when all credits unused', async () => {
      stripeBillingMeterEventService.sumMeterEvents.mockResolvedValue(0);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(stripeCreditGrantService.createCreditGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          creditUnits: 1000, // Capped at tierQuantity
        }),
      );
    });

    it('should not create grant when all credits used', async () => {
      stripeBillingMeterEventService.sumMeterEvents.mockResolvedValue(1000);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(stripeCreditGrantService.createCreditGrant).not.toHaveBeenCalled();
    });

    it('should not create grant when usage exceeds tier', async () => {
      stripeBillingMeterEventService.sumMeterEvents.mockResolvedValue(1500);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(stripeCreditGrantService.createCreditGrant).not.toHaveBeenCalled();
    });

    it('should void existing rollover grants before creating new one', async () => {
      const existingGrants = [
        {
          id: 'grant_old',
          metadata: { type: 'rollover' },
          voided_at: null,
        },
        {
          id: 'grant_other',
          metadata: { type: 'promotional' },
          voided_at: null,
        },
        {
          id: 'grant_voided',
          metadata: { type: 'rollover' },
          voided_at: 123456,
        },
      ] as unknown as Stripe.Billing.CreditGrant[];

      stripeCreditGrantService.listCreditGrants.mockResolvedValue(
        existingGrants,
      );
      stripeBillingMeterEventService.sumMeterEvents.mockResolvedValue(500);

      await service.processRolloverOnPeriodTransition(baseParams);

      // Should only void the active rollover grant, not promotional or already voided
      expect(stripeCreditGrantService.voidCreditGrant).toHaveBeenCalledTimes(1);
      expect(stripeCreditGrantService.voidCreditGrant).toHaveBeenCalledWith(
        'grant_old',
      );

      // Should create the new grant after voiding
      expect(stripeCreditGrantService.createCreditGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          creditUnits: 500, // 1000 - 500 = 500 unused
        }),
      );
    });
  });
});
