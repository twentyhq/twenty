import { gql } from '@apollo/client';
import { BILLING_SUBSCRIPTION_SCHEDULE_PHASE_ITEM_FRAGMENT } from '@/billing/graphql/fragments/billingSubscriptionSchedulePhaseItemFragment';
import { BILLING_SUBSCRIPTION_SCHEDULE_PHASE_FRAGMENT } from '@/billing/graphql/fragments/billingSubscriptionSchedulePhaseFragment';

export const BILLING_SUBSCRIPTION_FRAGMENT = gql`
  fragment BillingSubscriptionFragment on BillingSubscription {
    id
    status
    metadata
    phases {
      ...BillingSubscriptionSchedulePhaseFragment
    }
  }

  ${BILLING_SUBSCRIPTION_SCHEDULE_PHASE_ITEM_FRAGMENT}
  ${BILLING_SUBSCRIPTION_SCHEDULE_PHASE_FRAGMENT}
`;
