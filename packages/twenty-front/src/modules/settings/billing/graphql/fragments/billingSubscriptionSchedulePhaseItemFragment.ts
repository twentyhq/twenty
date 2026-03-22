import { gql } from '@apollo/client';

export const BILLING_SUBSCRIPTION_SCHEDULE_PHASE_ITEM_FRAGMENT = gql`
  fragment BillingSubscriptionSchedulePhaseItemFragment on BillingSubscriptionSchedulePhaseItem {
    price
    quantity
  }
`;
