import { gql } from '@apollo/client';
import { BILLING_SUBSCRIPTION_SCHEDULE_PHASE_FRAGMENT } from '@/billing/graphql/fragments/billingSubscriptionSchedulePhaseFragment';
import { BILLING_SUBSCRIPTION_SCHEDULE_PHASE_ITEM_FRAGMENT } from '@/billing/graphql/fragments/billingSubscriptionSchedulePhaseItemFragment';

export const CURRENT_BILLING_SUBSCRIPTION_FRAGMENT = gql`
  fragment CurrentBillingSubscriptionFragment on BillingSubscription {
    id
    status
    interval
    metadata
    currentPeriodEnd
    phases {
      ...BillingSubscriptionSchedulePhaseFragment
    }
    billingSubscriptionItems {
      id
      hasReachedCurrentPeriodCap
      quantity
      stripePriceId
      billingProduct {
        name
        description
        images
        metadata {
          productKey
          planKey
          priceUsageBased
        }
      }
    }
  }

  ${BILLING_SUBSCRIPTION_SCHEDULE_PHASE_ITEM_FRAGMENT}
  ${BILLING_SUBSCRIPTION_SCHEDULE_PHASE_FRAGMENT}
`;
