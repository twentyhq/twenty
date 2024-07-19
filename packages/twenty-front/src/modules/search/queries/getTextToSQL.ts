import { gql } from '@apollo/client';

export const getCopilot = gql`
  query GetAISQLQuery($text: String!) {
    getAISQLQuery(text: $text) {
      sqlQuery
      sqlQueryResult
      queryFailedErrorMessage
    }
  }
`;
