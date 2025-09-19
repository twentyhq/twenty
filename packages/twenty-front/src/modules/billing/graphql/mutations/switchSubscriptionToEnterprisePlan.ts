import { gql } from '@apollo/client';

export const SWITCH_BILLING_PLAN = gql`
  mutation SwitchBillingPlan {
    switchBillingPlan {
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
