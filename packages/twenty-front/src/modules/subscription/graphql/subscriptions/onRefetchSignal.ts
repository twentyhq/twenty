import { gql } from '@apollo/client';

export const ON_REFETCH_SIGNAL = gql`
  subscription OnRefetchSignal($subscriptions: [QuerySubscriptionInput!]!) {
    onRefetchSignal(subscriptions: $subscriptions) {
      subscriptionIds
    }
  }
`;

