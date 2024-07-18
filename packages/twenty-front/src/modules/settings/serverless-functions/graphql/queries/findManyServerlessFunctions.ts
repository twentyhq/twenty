import { gql } from '@apollo/client';

export const FIND_MANY_SERVERLESS_FUNCTIONS = gql`
  query GetManyServerlessFunctions {
    serverlessFunctions {
      edges {
        node {
          id
          name
          sourceCodeHash
          runtime
          syncStatus
          createdAt
          updatedAt
        }
      }
    }
  }
`;
