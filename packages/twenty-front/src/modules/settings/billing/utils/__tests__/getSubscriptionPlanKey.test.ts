import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import {
  BillingPlanKey,
  BillingProductKey,
} from '~/generated-metadata/graphql';

const subscriptionItem = (
  productKey: BillingProductKey,
  planKey: BillingPlanKey,
) => ({ billingProduct: { metadata: { productKey, planKey } } });

describe('getSubscriptionPlanKey', () => {
  it('reads the plan from the base product item', () => {
    expect(
      getSubscriptionPlanKey({
        billingSubscriptionItems: [
          subscriptionItem(
            BillingProductKey.METERED_PRODUCT,
            BillingPlanKey.PRO,
          ),
          subscriptionItem(
            BillingProductKey.BASE_PRODUCT,
            BillingPlanKey.ENTERPRISE,
          ),
        ],
      }),
    ).toBe(BillingPlanKey.ENTERPRISE);
  });

  it('ignores metadata.plan left behind by a scheduled switch', () => {
    expect(
      getSubscriptionPlanKey({
        metadata: { plan: BillingPlanKey.PRO },
        billingSubscriptionItems: [
          subscriptionItem(
            BillingProductKey.BASE_PRODUCT,
            BillingPlanKey.ENTERPRISE,
          ),
        ],
      } as Parameters<typeof getSubscriptionPlanKey>[0]),
    ).toBe(BillingPlanKey.ENTERPRISE);
  });

  it('returns undefined without a subscription', () => {
    expect(getSubscriptionPlanKey(undefined)).toBeUndefined();
    expect(
      getSubscriptionPlanKey({ billingSubscriptionItems: [] }),
    ).toBeUndefined();
  });
});
