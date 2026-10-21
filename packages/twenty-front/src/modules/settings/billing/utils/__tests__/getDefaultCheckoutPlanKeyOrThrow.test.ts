import { getDefaultCheckoutPlanKeyOrThrow } from '@/settings/billing/utils/getDefaultCheckoutPlanKeyOrThrow';
import { BillingPlanKey } from '~/generated-metadata/graphql';

describe('getDefaultCheckoutPlanKeyOrThrow', () => {
  it('returns the default checkout plan', () => {
    expect(
      getDefaultCheckoutPlanKeyOrThrow([
        { planKey: BillingPlanKey.PRO_V2, isCheckoutDefault: false },
        { planKey: BillingPlanKey.ORGANIZATION_V2, isCheckoutDefault: true },
      ]),
    ).toBe(BillingPlanKey.ORGANIZATION_V2);
  });

  it('throws when no plan is the default checkout plan', () => {
    expect(() =>
      getDefaultCheckoutPlanKeyOrThrow([
        { planKey: BillingPlanKey.PRO, isCheckoutDefault: false },
      ]),
    ).toThrow();
  });
});
