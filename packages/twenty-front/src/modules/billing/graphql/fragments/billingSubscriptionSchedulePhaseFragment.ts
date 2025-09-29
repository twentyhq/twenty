import { gql } from '@apollo/client';
import { BILLING_SUBSCRIPTION_SCHEDULE_PHASE_ITEM_FRAGMENT } from './billingSubscriptionSchedulePhaseItemFragment';

export const BILLING_SUBSCRIPTION_SCHEDULE_PHASE_FRAGMENT = gql`
  fragment BillingSubscriptionSchedulePhaseFragment on BillingSubscriptionSchedulePhase {
    start_date
    end_date
    items {
      ...BillingSubscriptionSchedulePhaseItemFragment
    }
  }
  ${BILLING_SUBSCRIPTION_SCHEDULE_PHASE_ITEM_FRAGMENT}
`;
