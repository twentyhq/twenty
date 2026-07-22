import { gql } from '@apollo/client';

export const MESSAGE_SUPPRESSIONS = gql`
  query MessageSuppressions($input: FindMessageSuppressionsInput!) {
    messageSuppressions(input: $input) {
      records {
        id
        createdAt
        emailAddress
        reason
        source
        unsubscribeTopicId
      }
      totalCount
    }
  }
`;
