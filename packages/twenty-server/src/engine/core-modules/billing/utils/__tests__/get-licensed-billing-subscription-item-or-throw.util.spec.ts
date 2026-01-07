import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { getCurrentLicensedBillingSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-licensed-billing-subscription-item-or-throw.util';

describe('getCurrentLicensedBillingSubscriptionItemOrThrow', () => {
  it('returns the licensed billing subscription item when found', () => {
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
      billingSubscriptionItems: [meteredItem, licensedItem],
    } as unknown as BillingSubscriptionEntity;

    const result =
      getCurrentLicensedBillingSubscriptionItemOrThrow(billingSubscription);

    expect(result).toBe(licensedItem);
  });

  it('returns the first licensed item when multiple licensed items exist', () => {
    const firstLicensedItem = {
      id: 'item_licensed_1',
      quantity: 5,
      billingProduct: {
        metadata: {
          priceUsageBased: BillingUsageType.LICENSED,
        },
      },
    };

    const secondLicensedItem = {
      id: 'item_licensed_2',
      quantity: 10,
      billingProduct: {
        metadata: {
          priceUsageBased: BillingUsageType.LICENSED,
        },
      },
    };

    const billingSubscription = {
      billingSubscriptionItems: [firstLicensedItem, secondLicensedItem],
    } as unknown as BillingSubscriptionEntity;

    const result =
      getCurrentLicensedBillingSubscriptionItemOrThrow(billingSubscription);

    expect(result).toBe(firstLicensedItem);
  });

  it('throws when no licensed billing subscription item is found', () => {
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
      billingSubscriptionItems: [meteredItem],
    } as unknown as BillingSubscriptionEntity;

    expect(() =>
      getCurrentLicensedBillingSubscriptionItemOrThrow(billingSubscription),
    ).toThrow();
  });

  it('throws when subscription has no items', () => {
    const billingSubscription = {
      billingSubscriptionItems: [],
    } as unknown as BillingSubscriptionEntity;

    expect(() =>
      getCurrentLicensedBillingSubscriptionItemOrThrow(billingSubscription),
    ).toThrow();
  });
});
