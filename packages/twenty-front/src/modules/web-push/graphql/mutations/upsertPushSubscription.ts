import { gql } from '@apollo/client';

export const UPSERT_PUSH_SUBSCRIPTION = gql`
  mutation UpsertPushSubscription($input: UpsertPushSubscriptionInput!) {
    upsertPushSubscription(input: $input)
  }
`;
