import { gql } from '@apollo/client';

export const CANCEL_SWITCH_BILLING_PLAN = gql`
  mutation CancelSwitchBillingPlan {
    cancelSwitchBillingPlan {
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
