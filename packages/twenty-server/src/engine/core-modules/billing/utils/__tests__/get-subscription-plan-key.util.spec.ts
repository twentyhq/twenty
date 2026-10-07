/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { getSubscriptionPlanKey } from 'src/engine/core-modules/billing/utils/get-subscription-plan-key.util';

const creditItem = {
  billingProduct: {
    metadata: {
      productKey: BillingProductKey.RESOURCE_CREDIT,
      planKey: BillingPlanKey.ENTERPRISE,
    },
  },
};

describe('getSubscriptionPlanKey', () => {
  it('reads the plan from the base product item', () => {
    expect(
      getSubscriptionPlanKey({
        billingSubscriptionItems: [
          creditItem,
          {
            billingProduct: {
              metadata: {
                productKey: BillingProductKey.BASE_PRODUCT,
                planKey: BillingPlanKey.PRO,
              },
            },
          },
        ],
      }),
    ).toBe(BillingPlanKey.PRO);
  });

  it('returns null for a subscription without items', () => {
    expect(getSubscriptionPlanKey({ billingSubscriptionItems: [] })).toBeNull();
  });

  it('ignores the plan carried by other products', () => {
    expect(
      getSubscriptionPlanKey({
        billingSubscriptionItems: [creditItem, { billingProduct: null }],
      }),
    ).toBeNull();
  });
});
