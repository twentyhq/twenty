import { gql } from '@apollo/client';

export const ADD_QUERY_TO_EVENT_STREAM_MUTATION = gql`
  mutation AddQueryToEventStream($input: AddQuerySubscriptionInput!) {
    addQueryToEventStream(input: $input)
  }
`;
