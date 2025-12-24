import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { getCurrentMeteredBillingSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-metered-billing-subscription-item-or-throw.util';

describe('getCurrentMeteredBillingSubscriptionItemOrThrow', () => {
  it('returns the metered billing subscription item when found', () => {
    const licensedItem = {
      id: 'item_licensed',
      quantity: 5,
      billingProduct: {
        metadata: {
          priceUsageBased: BillingUsageType.LICENSED,
        },
      },
    };

    const meteredItem = {
      id: 'item_metered',
      quantity: null,
      billingProduct: {
        metadata: {
          priceUsageBased: BillingUsageType.METERED,
        },
      },
    };

    const billingSubscription = {
      billingSubscriptionItems: [licensedItem, meteredItem],
    } as unknown as BillingSubscriptionEntity;

    const result =
      getCurrentMeteredBillingSubscriptionItemOrThrow(billingSubscription);

    expect(result).toBe(meteredItem);
  });

  it('throws when no metered billing subscription item is found', () => {
    const licensedItem = {
      id: 'item_licensed',
      quantity: 5,
      billingProduct: {
        metadata: {
          priceUsageBased: BillingUsageType.LICENSED,
        },
      },
    };

    const billingSubscription = {
      billingSubscriptionItems: [licensedItem],
    } as unknown as BillingSubscriptionEntity;

    expect(() =>
      getCurrentMeteredBillingSubscriptionItemOrThrow(billingSubscription),
    ).toThrow();
  });
});
