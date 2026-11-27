import { splitPhaseItemsInPricesOrThrow } from '@/settings/billing/utils/splitPhaseItemsInPricesOrThrow';
import {
  type BillingPriceLicensed,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const basePrice: BillingPriceLicensed = {
  stripePriceId: 'price_base',
  unitAmount: 1200,
  recurringInterval: SubscriptionInterval.Month,
  creditAmount: null,
  isSellable: true,
};

const resourceCreditPrice: BillingPriceLicensed = {
  stripePriceId: 'price_resource_credit',
  unitAmount: 2000,
  recurringInterval: SubscriptionInterval.Month,
  creditAmount: 1000,
  isSellable: true,
};

const billingPrices = [basePrice, resourceCreditPrice];

describe('splitPhaseItemsInPricesOrThrow', () => {
  it('splits the phase into its base and resource credit prices', () => {
    expect(
      splitPhaseItemsInPricesOrThrow({
        phaseItems: [
          { price: 'price_base' },
          { price: 'price_resource_credit' },
        ],
        billingPrices,
      }),
    ).toEqual({
      nextBasePrice: basePrice,
      nextResourceCreditPrice: resourceCreditPrice,
    });
  });

  it('leaves out a price missing from the plans catalog', () => {
    expect(
      splitPhaseItemsInPricesOrThrow({
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

  it('throws when the phase has no resource credit price', () => {
    expect(() =>
      splitPhaseItemsInPricesOrThrow({
        phaseItems: [{ price: 'price_base' }, { price: 'price_application' }],
        billingPrices,
      }),
    ).toThrow('Next billing phase has no base or resource credit price');
  });

  it('throws when the phase has no base price', () => {
    expect(() =>
      splitPhaseItemsInPricesOrThrow({
        phaseItems: [{ price: 'price_resource_credit' }],
        billingPrices,
      }),
    ).toThrow('Next billing phase has no base or resource credit price');
  });
});
