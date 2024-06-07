import { gql } from '@apollo/client';

export const getTextToSQL = gql`
  query GetTextToSQL($text: String!) {
    getTextToSQL(text: $text) {
      sqlQuery
      sqlQueryResult
    }
  }
`;
