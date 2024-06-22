import { gql } from '@apollo/client';

export const getAskAI = gql`
  query GetAskAI($text: String!) {
    getAskAI(text: $text) {
      sqlQuery
      sqlQueryResult
      recordMetadataById
    }
  }
`;
