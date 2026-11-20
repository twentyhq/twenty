import { gql } from '@apollo/client';

export const UPSERT_WEB_PUSH_SUBSCRIPTION = gql`
  mutation UpsertWebPushSubscription($input: UpsertWebPushSubscriptionInput!) {
    upsertWebPushSubscription(input: $input)
  }
`;
