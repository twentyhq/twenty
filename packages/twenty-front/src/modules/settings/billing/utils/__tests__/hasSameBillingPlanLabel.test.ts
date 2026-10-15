import { hasSameBillingPlanLabel } from '@/settings/billing/utils/hasSameBillingPlanLabel';
import { BillingPlanKey } from '~/generated-metadata/graphql';

describe('hasSameBillingPlanLabel', () => {
  it('matches plans sharing a label', () => {
    expect(
      hasSameBillingPlanLabel(BillingPlanKey.PRO, BillingPlanKey.PRO_V2),
    ).toBe(true);
    expect(
      hasSameBillingPlanLabel(
        BillingPlanKey.ENTERPRISE,
        BillingPlanKey.ORGANIZATION_V2,
      ),
    ).toBe(true);
  });

  it('does not match plans with different labels', () => {
    expect(
      hasSameBillingPlanLabel(BillingPlanKey.PRO, BillingPlanKey.ENTERPRISE),
    ).toBe(false);
    expect(
      hasSameBillingPlanLabel(
        BillingPlanKey.PRO_V2,
        BillingPlanKey.ORGANIZATION_V2,
      ),
    ).toBe(false);
  });
});
