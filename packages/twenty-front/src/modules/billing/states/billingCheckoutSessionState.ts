import { syncEffect } from 'recoil-sync';
import { createState } from 'twenty-ui';

import { BillingPlanKey, SubscriptionInterval } from '~/generated/graphql';

export type BillingCheckoutSessionState = {
  plan: BillingPlanKey;
  interval: SubscriptionInterval;
  requirePaymentMethod: boolean;
  skipPlanPage: boolean;
};

export const billingCheckoutSessionState =
  createState<BillingCheckoutSessionState>({
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
              value: value as BillingCheckoutSessionState,
              warnings: [],
            } as const;
          }
          return {
            type: 'failure',
            message: 'Invalid BillingCheckoutSessionState',
            path: [] as any,
          } as const;
        },
        /*
      read: (key: string) => {
        const params = new URLSearchParams(window.location.search);
        const value = params.get(key);
        if (!value) return undefined;
        try {
          return JSON.parse(value);
        } catch {
          return undefined;
        }
      },
      write: ({ diff }) => {
        const params = new URLSearchParams(window.location.search);
        Object.entries(diff).forEach(([key, value]) => {
          if (value === undefined) {
            params.delete(key);
          } else {
            params.set(key, JSON.stringify(value));
          }
        });
        window.history.replaceState(null, '', `?${params.toString()}`);
      },
      */
      }),
    ],
  });
