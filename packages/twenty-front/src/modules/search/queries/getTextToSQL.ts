import { gql } from '@apollo/client';

export const getAskAI = gql`
  query GetAISQLQuery($text: String!) {
    getAISQLQuery(text: $text) {
      sqlQuery
      sqlQueryResult
      queryFailedErrorMessage
    }
  }
`;
