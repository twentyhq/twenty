import { atom } from 'recoil';
import { SubscriptionInterval } from '~/generated-metadata/graphql';
import { BillingPlanKey } from '~/generated/graphql';

type BillingCheckoutState = {
  plan: BillingPlanKey;
  interval: SubscriptionInterval;
  requirePaymentMethod: boolean;
  skipPlanPage: boolean;
};

export const billingCheckoutState = atom<BillingCheckoutState>({
  key: 'billingCheckoutState',
  default: {
    plan: BillingPlanKey.Pro,
    interval: SubscriptionInterval.Month,
    requirePaymentMethod: true,
    skipPlanPage: false,
  },
});
