import Stripe from 'stripe';

import { BillingPriceBillingScheme } from 'src/engine/core-modules/billing/enums/billing-price-billing-scheme.enum';
import { BillingPriceTaxBehavior } from 'src/engine/core-modules/billing/enums/billing-price-tax-behavior.enum';
import { BillingPriceTiersMode } from 'src/engine/core-modules/billing/enums/billing-price-tiers-mode.enum';
import { BillingPriceType } from 'src/engine/core-modules/billing/enums/billing-price-type.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { transformStripePriceDataToPriceRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-price-data-to-price-repository-data.util';
describe('transformStripePriceDataToPriceRepositoryData', () => {
  const createMockPrice = (overrides = {}): Stripe.Price =>
    ({
      id: 'price_123',
      active: true,
      product: 'prod_123',
      currency: 'usd',
      nickname: null,
      tax_behavior: null,
      type: 'recurring',
      billing_scheme: 'per_unit',
      unit_amount_decimal: '1000',
      unit_amount: 1000,
      transform_quantity: null,
      recurring: {
        usage_type: 'licensed',
        interval: 'month',
        meter: null,
      },
      currency_options: null,
      tiers: null,
      tiers_mode: null,
      ...overrides,
    }) as unknown as Stripe.Price;

  it('should transform basic price data correctly', () => {
    const mockPrice = createMockPrice();
    const result = transformStripePriceDataToPriceRepositoryData(mockPrice);

    expect(result).toEqual({
      stripePriceId: 'price_123',
      active: true,
      stripeProductId: 'prod_123',
      stripeMeterId: null,
      currency: 'USD',
      nickname: undefined,
      taxBehavior: undefined,
      type: BillingPriceType.RECURRING,
      billingScheme: BillingPriceBillingScheme.PER_UNIT,
      unitAmountDecimal: '1000',
      unitAmount: 1000,
      transformQuantity: undefined,
      usageType: BillingUsageType.LICENSED,
      interval: SubscriptionInterval.Month,
      currencyOptions: undefined,
      tiers: undefined,
      tiersMode: undefined,
      recurring: {
        usage_type: 'licensed',
        interval: 'month',
        meter: null,
      },
    });
  });

  describe('tax behavior transformations', () => {
    it.each([
      ['exclusive', BillingPriceTaxBehavior.EXCLUSIVE],
      ['inclusive', BillingPriceTaxBehavior.INCLUSIVE],
      ['unspecified', BillingPriceTaxBehavior.UNSPECIFIED],
    ])(
      'should transform tax behavior %s correctly',
      (stripeTaxBehavior, expected) => {
        const mockPrice = createMockPrice({
          tax_behavior: stripeTaxBehavior as Stripe.Price.TaxBehavior,
        });
        const result = transformStripePriceDataToPriceRepositoryData(mockPrice);

        expect(result.taxBehavior).toBe(expected);
      },
    );
  });

  describe('price type transformations', () => {
    it.each([
      ['one_time', BillingPriceType.ONE_TIME],
      ['recurring', BillingPriceType.RECURRING],
    ])('should transform price type %s correctly', (stripeType, expected) => {
      const mockPrice = createMockPrice({
        type: stripeType as Stripe.Price.Type,
      });
      const result = transformStripePriceDataToPriceRepositoryData(mockPrice);

      expect(result.type).toBe(expected);
    });
  });

  describe('billing scheme transformations', () => {
    it.each([
      ['per_unit', BillingPriceBillingScheme.PER_UNIT],
      ['tiered', BillingPriceBillingScheme.TIERED],
    ])(
      'should transform billing scheme %s correctly',
      (stripeScheme, expected) => {
        const mockPrice = createMockPrice({
          billing_scheme: stripeScheme as Stripe.Price.BillingScheme,
        });
        const result = transformStripePriceDataToPriceRepositoryData(mockPrice);

        expect(result.billingScheme).toBe(expected);
      },
    );
  });

  describe('recurring price configurations', () => {
    it('should handle metered pricing with meter ID', () => {
      const mockPrice = createMockPrice({
        recurring: {
          usage_type: 'metered',
          interval: 'month',
          meter: 'meter_123',
        },
      });
      const result = transformStripePriceDataToPriceRepositoryData(mockPrice);

      expect(result.stripeMeterId).toBe('meter_123');
      expect(result.usageType).toBe(BillingUsageType.METERED);
    });

    it.each([
      ['month', SubscriptionInterval.Month],
      ['day', SubscriptionInterval.Day],
      ['week', SubscriptionInterval.Week],
      ['year', SubscriptionInterval.Year],
    ])('should transform interval %s correctly', (stripeInterval, expected) => {
      const mockPrice = createMockPrice({
        recurring: {
          usage_type: 'licensed',
          interval: stripeInterval as Stripe.Price.Recurring.Interval,
          meter: null,
        },
      });
      const result = transformStripePriceDataToPriceRepositoryData(mockPrice);

      expect(result.interval).toBe(expected);
    });
  });

  describe('tiered pricing configurations', () => {
    const mockTiers = [
      { up_to: 10, unit_amount: 1000 },
      { up_to: 20, unit_amount: 800 },
    ];

    it.each([
      ['graduated', BillingPriceTiersMode.GRADUATED],
      ['volume', BillingPriceTiersMode.VOLUME],
    ])(
      'should transform tiers mode %s correctly',
      (stripeTiersMode, expected) => {
        const mockPrice = createMockPrice({
          billing_scheme: 'tiered',
          tiers: mockTiers,
          tiers_mode: stripeTiersMode as Stripe.Price.TiersMode,
        });
        const result = transformStripePriceDataToPriceRepositoryData(mockPrice);

        expect(result.tiersMode).toBe(expected);
        expect(result.tiers).toEqual(mockTiers);
      },
    );
  });

  describe('optional fields handling', () => {
    it('should handle transform quantity configuration', () => {
      const transformQuantity = {
        divide_by: 100,
        round: 'up',
      };
      const mockPrice = createMockPrice({
        transform_quantity: transformQuantity,
      });
      const result = transformStripePriceDataToPriceRepositoryData(mockPrice);

      expect(result.transformQuantity).toEqual(transformQuantity);
    });

    it('should handle currency options', () => {
      const currencyOptions = {
        eur: {
          unit_amount: 850,
          unit_amount_decimal: '850',
        },
      };
      const mockPrice = createMockPrice({ currency_options: currencyOptions });
      const result = transformStripePriceDataToPriceRepositoryData(mockPrice);

      expect(result.currencyOptions).toEqual(currencyOptions);
    });

    it('should handle null and undefined fields correctly', () => {
      const mockPrice = createMockPrice({
        nickname: null,
        unit_amount: null,
        unit_amount_decimal: null,
        transform_quantity: null,
        tiers: null,
        currency_options: null,
      });
      const result = transformStripePriceDataToPriceRepositoryData(mockPrice);

      expect(result.nickname).toBeUndefined();
      expect(result.unitAmount).toBeUndefined();
      expect(result.unitAmountDecimal).toBeUndefined();
      expect(result.transformQuantity).toBeUndefined();
      expect(result.tiers).toBeUndefined();
      expect(result.currencyOptions).toBeUndefined();
    });
  });
});
