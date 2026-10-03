import { gql } from '@apollo/client';

export const DISCOVER_MESSAGE = gql`
  query DiscoverMessage($messageId: UUID!) {
    messages(discover: true, filter: { id: { eq: $messageId } }) {
      edges {
        node {
          id
        }
      }
    }
  }
`;
