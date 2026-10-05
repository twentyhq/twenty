import { usePriceAndBillingUsageByPriceId } from '@/settings/billing/hooks/usePriceAndBillingUsageByPriceId';
import {
  type BillingPriceLicensed,
  type BillingPriceMetered,
  BillingUsageType,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const mockAllBillingPrices = jest.fn();

jest.mock('@/settings/billing/hooks/useAllBillingPrices', () => ({
  useAllBillingPrices: () => ({ allBillingPrices: mockAllBillingPrices() }),
}));

const licensedPrice: BillingPriceLicensed = {
  stripePriceId: 'price_base',
  unitAmount: 1200,
  recurringInterval: SubscriptionInterval.Month,
  priceUsageType: BillingUsageType.LICENSED,
  creditAmount: null,
  isSellable: true,
};

const meteredPrice: BillingPriceMetered = {
  stripePriceId: 'price_metered',
  recurringInterval: SubscriptionInterval.Month,
  priceUsageType: BillingUsageType.METERED,
  tiers: [],
};

describe('usePriceAndBillingUsageByPriceId', () => {
  beforeEach(() => {
    mockAllBillingPrices.mockReturnValue([licensedPrice, meteredPrice]);
  });

  it('returns a catalog price with its usage type', () => {
    const { getPriceAndBillingUsageByPriceId } =
      usePriceAndBillingUsageByPriceId();

    expect(getPriceAndBillingUsageByPriceId('price_base')).toEqual({
      price: licensedPrice,
      billingUsage: BillingUsageType.LICENSED,
    });
    expect(getPriceAndBillingUsageByPriceId('price_metered')).toEqual({
      price: meteredPrice,
      billingUsage: BillingUsageType.METERED,
    });
  });

  it('returns undefined for a price missing from the plans catalog', () => {
    const { getPriceAndBillingUsageByPriceId } =
      usePriceAndBillingUsageByPriceId();

    expect(getPriceAndBillingUsageByPriceId('price_add_on')).toBeUndefined();
  });
});
