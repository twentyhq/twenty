import { getComparedBillingPlanKeysOrThrow } from '@/settings/billing/utils/getComparedBillingPlanKeysOrThrow';
import { BillingPlanKey } from '~/generated-metadata/graphql';

const plan = (planKey: BillingPlanKey, isSellable: boolean) => ({
  isSellable,
  planKey,
});

describe('getComparedBillingPlanKeysOrThrow', () => {
  it('returns the two plans on sale in list order', () => {
    expect(
      getComparedBillingPlanKeysOrThrow([
        plan(BillingPlanKey.PRO, false),
        plan(BillingPlanKey.ENTERPRISE, false),
        plan(BillingPlanKey.PRO_V2, true),
        plan(BillingPlanKey.ORGANIZATION_V2, true),
      ]),
    ).toEqual([BillingPlanKey.PRO_V2, BillingPlanKey.ORGANIZATION_V2]);
  });

  it('throws when fewer than two plans are on sale', () => {
    expect(() =>
      getComparedBillingPlanKeysOrThrow([
        plan(BillingPlanKey.PRO, true),
        plan(BillingPlanKey.ENTERPRISE, false),
      ]),
    ).toThrow();
  });

  it('throws when more than two plans are on sale', () => {
    expect(() =>
      getComparedBillingPlanKeysOrThrow([
        plan(BillingPlanKey.PRO, true),
        plan(BillingPlanKey.ENTERPRISE, true),
        plan(BillingPlanKey.PRO_V2, true),
      ]),
    ).toThrow();
  });
});
