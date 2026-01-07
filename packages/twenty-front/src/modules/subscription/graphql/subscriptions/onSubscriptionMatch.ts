import { gql } from '@apollo/client';

export const ON_SUBSCRIPTION_MATCH = gql`
  subscription OnSubscriptionMatch($subscriptions: [SubscriptionInput!]!) {
    onSubscriptionMatch(subscriptions: $subscriptions) {
      matches {
        subscriptionIds
        event {
          action
          objectNameSingular
          eventDate
          record
          updatedFields
        }
      }
    }
  }
`;
