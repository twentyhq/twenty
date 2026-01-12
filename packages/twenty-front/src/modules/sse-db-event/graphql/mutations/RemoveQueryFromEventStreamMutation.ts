import { gql } from '@apollo/client';

export const REMOVE_QUERY_FROM_EVENT_STREAM_MUTATION = gql`
  mutation RemoveQueryFromEventStream(
    $input: RemoveQueryFromEventStreamInput!
  ) {
    removeQueryFromEventStream(input: $input)
  }
`;
