import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';
import {
  type BillingPriceLicensed,
  BillingUsageType,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const mockNextBillingPhase = jest.fn();
const mockAllBillingPrices = jest.fn();

jest.mock('@/settings/billing/hooks/useNextBillingPhase', () => ({
  useNextBillingPhase: () => ({ nextBillingPhase: mockNextBillingPhase() }),
}));

jest.mock('@/settings/billing/hooks/useAllBillingPrices', () => ({
  useAllBillingPrices: () => ({ allBillingPrices: mockAllBillingPrices() }),
}));

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

describe('useSplitPhaseItemsInPrices', () => {
  beforeEach(() => {
    mockAllBillingPrices.mockReturnValue([basePrice, resourceCreditPrice]);
  });

  it('splits the next phase into its base and resource credit prices', () => {
    mockNextBillingPhase.mockReturnValue({
      items: [
        { price: 'price_base', quantity: 3 },
        { price: 'price_resource_credit', quantity: 1 },
      ],
    });

    const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();

    expect(splitedPhaseItemsInPrices).toEqual({
      nextBasePrice: basePrice,
      nextResourceCreditPrice: resourceCreditPrice,
    });
  });

  it('leaves out a next phase price missing from the plans catalog', () => {
    mockNextBillingPhase.mockReturnValue({
      items: [
        { price: 'price_base', quantity: 3 },
        { price: 'price_resource_credit', quantity: 1 },
        { price: 'price_add_on', quantity: 1 },
      ],
    });

    const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();

    expect(splitedPhaseItemsInPrices).toEqual({
      nextBasePrice: basePrice,
      nextResourceCreditPrice: resourceCreditPrice,
    });
  });
});
