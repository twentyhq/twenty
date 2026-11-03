import { gql } from '@apollo/client';

export const getMessageThreadChannel = gql`
  query GetMessageThreadChannel($messageThreadId: UUID!) {
    getMessageThreadChannel(messageThreadId: $messageThreadId) {
      type
      provider
      applicationId
    }
  }
`;
