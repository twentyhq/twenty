import { getDefaultCheckoutPlanKeyOrThrow } from '@/settings/billing/utils/getDefaultCheckoutPlanKeyOrThrow';
import { BillingPlanKey } from '~/generated-metadata/graphql';

describe('getDefaultCheckoutPlanKeyOrThrow', () => {
  it('returns the first plan on sale', () => {
    expect(
      getDefaultCheckoutPlanKeyOrThrow([
        { planKey: BillingPlanKey.ORGANIZATION_V2, isSellable: true },
        { planKey: BillingPlanKey.PRO_V2, isSellable: true },
        { planKey: BillingPlanKey.PRO, isSellable: false },
      ]),
    ).toBe(BillingPlanKey.ORGANIZATION_V2);
  });

  it('throws when no plan is on sale', () => {
    expect(() =>
      getDefaultCheckoutPlanKeyOrThrow([
        { planKey: BillingPlanKey.PRO, isSellable: false },
      ]),
    ).toThrow();
  });
});
