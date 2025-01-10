import { BillingPriceBillingScheme } from 'src/engine/core-modules/billing/enums/billing-price-billing-scheme.enum';
import { BillingPriceTaxBehavior } from 'src/engine/core-modules/billing/enums/billing-price-tax-behavior.enum';
import { BillingPriceTiersMode } from 'src/engine/core-modules/billing/enums/billing-price-tiers-mode.enum';
import { BillingPriceType } from 'src/engine/core-modules/billing/enums/billing-price-type.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { transformStripePriceEventToPriceRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-price-event-to-price-repository-data.util';

describe('transformStripePriceEventToPriceRepositoryData', () => {
  const createMockPriceData = (overrides = {}) => ({
    object: {
      id: 'price_123',
      active: true,
      product: 'prod_123',
      meter: null,
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
      },
      currency_options: null,
      tiers: null,
      tiers_mode: null,
      ...overrides,
    },
  });

  it('should transform basic price data correctly', () => {
    const mockData = createMockPriceData();
    const result = transformStripePriceEventToPriceRepositoryData(
      mockData as any,
    );

    expect(result).toEqual({
      stripePriceId: 'price_123',
      active: true,
      stripeProductId: 'prod_123',
      stripeMeterId: undefined,
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
      },
    });
  });

  it('should handle all tax behaviors correctly', () => {
    const taxBehaviors = [
      ['exclusive', BillingPriceTaxBehavior.EXCLUSIVE],
      ['inclusive', BillingPriceTaxBehavior.INCLUSIVE],
      ['unspecified', BillingPriceTaxBehavior.UNSPECIFIED],
    ];

    taxBehaviors.forEach(([stripeTaxBehavior, expectedTaxBehavior]) => {
      const mockData = createMockPriceData({
        tax_behavior: stripeTaxBehavior,
      });
      const result = transformStripePriceEventToPriceRepositoryData(
        mockData as any,
      );

      expect(result.taxBehavior).toBe(expectedTaxBehavior);
    });
  });

  it('should handle all price types correctly', () => {
    const priceTypes = [
      ['one_time', BillingPriceType.ONE_TIME],
      ['recurring', BillingPriceType.RECURRING],
    ];

    priceTypes.forEach(([stripeType, expectedType]) => {
      const mockData = createMockPriceData({ type: stripeType });
      const result = transformStripePriceEventToPriceRepositoryData(
        mockData as any,
      );

      expect(result.type).toBe(expectedType);
    });
  });

  it('should handle all billing schemes correctly', () => {
    const billingSchemes = [
      ['per_unit', BillingPriceBillingScheme.PER_UNIT],
      ['tiered', BillingPriceBillingScheme.TIERED],
    ];

    billingSchemes.forEach(([stripeScheme, expectedScheme]) => {
      const mockData = createMockPriceData({ billing_scheme: stripeScheme });
      const result = transformStripePriceEventToPriceRepositoryData(
        mockData as any,
      );

      expect(result.billingScheme).toBe(expectedScheme);
    });
  });

  it('should handle all usage types correctly', () => {
    const usageTypes = [
      ['licensed', BillingUsageType.LICENSED],
      ['metered', BillingUsageType.METERED],
    ];

    usageTypes.forEach(([stripeUsageType, expectedUsageType]) => {
      const mockData = createMockPriceData({
        recurring: { usage_type: stripeUsageType, interval: 'month' },
      });
      const result = transformStripePriceEventToPriceRepositoryData(
        mockData as any,
      );

      expect(result.usageType).toBe(expectedUsageType);
    });
  });

  it('should handle all tiers modes correctly', () => {
    const tiersModes = [
      ['graduated', BillingPriceTiersMode.GRADUATED],
      ['volume', BillingPriceTiersMode.VOLUME],
    ];

    tiersModes.forEach(([stripeTiersMode, expectedTiersMode]) => {
      const mockData = createMockPriceData({ tiers_mode: stripeTiersMode });
      const result = transformStripePriceEventToPriceRepositoryData(
        mockData as any,
      );

      expect(result.tiersMode).toBe(expectedTiersMode);
    });
  });

  it('should handle all intervals correctly', () => {
    const intervals = [
      ['month', SubscriptionInterval.Month],
      ['day', SubscriptionInterval.Day],
      ['week', SubscriptionInterval.Week],
      ['year', SubscriptionInterval.Year],
    ];

    intervals.forEach(([stripeInterval, expectedInterval]) => {
      const mockData = createMockPriceData({
        recurring: { usage_type: 'licensed', interval: stripeInterval },
      });
      const result = transformStripePriceEventToPriceRepositoryData(
        mockData as any,
      );

      expect(result.interval).toBe(expectedInterval);
    });
  });

  it('should handle tiered pricing configuration', () => {
    const mockTiers = [
      { up_to: 10, unit_amount: 1000 },
      { up_to: 20, unit_amount: 800 },
    ];

    const mockData = createMockPriceData({
      billing_scheme: 'tiered',
      tiers: mockTiers,
      tiers_mode: 'graduated',
    });

    const result = transformStripePriceEventToPriceRepositoryData(
      mockData as any,
    );

    expect(result.billingScheme).toBe(BillingPriceBillingScheme.TIERED);
    expect(result.tiers).toEqual(mockTiers);
    expect(result.tiersMode).toBe(BillingPriceTiersMode.GRADUATED);
  });

  it('should handle metered pricing with transform quantity', () => {
    const mockTransformQuantity = {
      divide_by: 100,
      round: 'up',
    };

    const mockData = createMockPriceData({
      recurring: {
        usage_type: 'metered',
        interval: 'month',
        meter: 'meter_123',
      },
      transform_quantity: mockTransformQuantity,
    });

    const result = transformStripePriceEventToPriceRepositoryData(
      mockData as any,
    );

    expect(result.stripeMeterId).toBe('meter_123');
    expect(result.usageType).toBe(BillingUsageType.METERED);
    expect(result.transformQuantity).toEqual(mockTransformQuantity);
  });

  it('should handle currency options', () => {
    const mockCurrencyOptions = {
      eur: {
        unit_amount: 850,
        unit_amount_decimal: '850',
      },
    };

    const mockData = createMockPriceData({
      currency_options: mockCurrencyOptions,
    });

    const result = transformStripePriceEventToPriceRepositoryData(
      mockData as any,
    );

    expect(result.currencyOptions).toEqual(mockCurrencyOptions);
  });
});
