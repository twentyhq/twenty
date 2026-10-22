import { getReverseTrialPlanKeys } from '@/settings/billing/utils/getReverseTrialPlanKeys';
import { BillingPlanKey } from '~/generated-metadata/graphql';

describe('getReverseTrialPlanKeys', () => {
  it('returns the default plan and its single downgrade target', () => {
    expect(
      getReverseTrialPlanKeys([
        {
          planKey: BillingPlanKey.ORGANIZATION_V2,
          isCheckoutDefault: true,
          downgradePlanKeys: [BillingPlanKey.PRO_V2],
        },
        {
          planKey: BillingPlanKey.PRO_V2,
          isCheckoutDefault: false,
          downgradePlanKeys: [],
        },
      ]),
    ).toEqual({
      trialPlanKey: BillingPlanKey.ORGANIZATION_V2,
      downgradePlanKey: BillingPlanKey.PRO_V2,
    });
  });

  it('returns undefined with the legacy config, where the default plan only upgrades', () => {
    expect(
      getReverseTrialPlanKeys([
        {
          planKey: BillingPlanKey.PRO,
          isCheckoutDefault: true,
          downgradePlanKeys: [],
        },
        {
          planKey: BillingPlanKey.ENTERPRISE,
          isCheckoutDefault: false,
          downgradePlanKeys: [BillingPlanKey.PRO],
        },
      ]),
    ).toBeUndefined();
  });

  it.each([
    [[BillingPlanKey.PRO_V2, BillingPlanKey.PRO]],
    [[BillingPlanKey.ORGANIZATION_V2]],
  ])(
    'returns undefined when the default plan downgrades to %j',
    (downgradePlanKeys) => {
      expect(
        getReverseTrialPlanKeys([
          {
            planKey: BillingPlanKey.ORGANIZATION_V2,
            isCheckoutDefault: true,
            downgradePlanKeys,
          },
        ]),
      ).toBeUndefined();
    },
  );

  it('returns undefined when no plan is the default', () => {
    expect(
      getReverseTrialPlanKeys([
        {
          planKey: BillingPlanKey.ORGANIZATION_V2,
          isCheckoutDefault: false,
          downgradePlanKeys: [BillingPlanKey.PRO_V2],
        },
      ]),
    ).toBeUndefined();
  });
});
