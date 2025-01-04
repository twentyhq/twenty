import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { createState } from '@ui/utilities/state/utils/createState';
import { syncEffect } from 'recoil-sync';
import { BillingPlanKey, SubscriptionInterval } from '~/generated/graphql';

export const billingCheckoutSessionState = createState<BillingCheckoutSession>({
  key: 'billingCheckoutSessionState',
  defaultValue: {
    plan: BillingPlanKey.Pro,
    interval: SubscriptionInterval.Month,
    requirePaymentMethod: true,
    skipPlanPage: false,
  },
  effects: [
    syncEffect({
      refine: (value: unknown) => {
        if (
          typeof value === 'object' &&
          value !== null &&
          'plan' in value &&
          'interval' in value &&
          'requirePaymentMethod' in value &&
          'skipPlanPage' in value
        ) {
          return {
            type: 'success',
            value: value as BillingCheckoutSession,
            warnings: [],
          } as const;
        }
        return {
          type: 'failure',
          message: 'Invalid BillingCheckoutSessionState',
          path: [] as any,
        } as const;
      },
    }),
  ],
});
