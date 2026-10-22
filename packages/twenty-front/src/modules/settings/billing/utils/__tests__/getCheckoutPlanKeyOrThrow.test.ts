import { getCheckoutPlanKeyOrThrow } from '@/settings/billing/utils/getCheckoutPlanKeyOrThrow';
import { BillingPlanKey } from '~/generated-metadata/graphql';

const plans = [
  {
    planKey: BillingPlanKey.PRO,
    isSellable: false,
    isCheckoutDefault: false,
  },
  {
    planKey: BillingPlanKey.PRO_V2,
    isSellable: true,
    isCheckoutDefault: true,
  },
  {
    planKey: BillingPlanKey.ORGANIZATION_V2,
    isSellable: true,
    isCheckoutDefault: false,
  },
];

describe('getCheckoutPlanKeyOrThrow', () => {
  it('returns the requested plan when it is on sale', () => {
    expect(
      getCheckoutPlanKeyOrThrow({
        plans,
        requestedPlanKey: BillingPlanKey.ORGANIZATION_V2,
      }),
    ).toBe(BillingPlanKey.ORGANIZATION_V2);
  });

  it.each([undefined, BillingPlanKey.PRO])(
    'returns the default checkout plan when %s is requested',
    (requestedPlanKey) => {
      expect(getCheckoutPlanKeyOrThrow({ plans, requestedPlanKey })).toBe(
        BillingPlanKey.PRO_V2,
      );
    },
  );

  it('throws when no plan is the default checkout plan', () => {
    expect(() =>
      getCheckoutPlanKeyOrThrow({
        plans: [
          {
            planKey: BillingPlanKey.PRO,
            isSellable: false,
            isCheckoutDefault: false,
          },
        ],
      }),
    ).toThrow();
  });
});
