import { splitPhaseItemsInPrices } from '@/settings/billing/utils/splitPhaseItemsInPrices';
import {
  type BillingPriceLicensed,
  type BillingPriceMetered,
  BillingUsageType,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const basePrice: BillingPriceLicensed = {
  stripePriceId: 'price_base',
  unitAmount: 1200,
  recurringInterval: SubscriptionInterval.Month,
  priceUsageType: BillingUsageType.LICENSED,
  creditAmount: null,
  isSellable: true,
};

const resourceCreditPrice: BillingPriceLicensed = {
  stripePriceId: 'price_resource_credit',
  unitAmount: 2000,
  recurringInterval: SubscriptionInterval.Month,
  priceUsageType: BillingUsageType.LICENSED,
  creditAmount: 1000,
  isSellable: true,
};

const meteredPrice: BillingPriceMetered = {
  stripePriceId: 'price_metered',
  recurringInterval: SubscriptionInterval.Month,
  priceUsageType: BillingUsageType.METERED,
  tiers: [],
};

const billingPrices = [basePrice, resourceCreditPrice, meteredPrice];

describe('splitPhaseItemsInPrices', () => {
  it('splits the phase into its base and resource credit prices', () => {
    expect(
      splitPhaseItemsInPrices({
        phaseItems: [
          { price: 'price_base' },
          { price: 'price_resource_credit' },
          { price: 'price_metered' },
        ],
        billingPrices,
      }),
    ).toEqual({
      nextBasePrice: basePrice,
      nextResourceCreditPrice: resourceCreditPrice,
    });
  });

  it('leaves out a price missing from the plans catalog and keeps the known ones', () => {
    expect(
      splitPhaseItemsInPrices({
        phaseItems: [
          { price: 'price_base' },
          { price: 'price_application' },
          { price: 'price_resource_credit' },
        ],
        billingPrices,
      }),
    ).toEqual({
      nextBasePrice: basePrice,
      nextResourceCreditPrice: resourceCreditPrice,
    });
  });

  it('returns no price for an empty phase', () => {
    expect(splitPhaseItemsInPrices({ phaseItems: [], billingPrices })).toEqual(
      {},
    );
  });
});
