import { gql } from '@apollo/client';

export const SWITCH_BILLING_PLAN = gql`
  mutation SwitchBillingPlan($plan: BillingPlanKey) {
    switchBillingPlan(plan: $plan) {
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
