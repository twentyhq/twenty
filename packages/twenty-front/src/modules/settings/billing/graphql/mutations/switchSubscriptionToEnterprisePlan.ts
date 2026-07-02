import { gql } from '@apollo/client';

export const SWITCH_BILLING_PLAN = gql`
  mutation SwitchBillingPlan(
    $targetPlanKey: BillingPlanKey!
    $targetInterval: SubscriptionInterval!
  ) {
    switchBillingPlan: switchBillingPlanForInterval(
      targetPlanKey: $targetPlanKey
      targetInterval: $targetInterval
    ) {
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
