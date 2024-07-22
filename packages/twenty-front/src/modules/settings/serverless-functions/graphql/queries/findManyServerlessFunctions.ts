import { gql } from '@apollo/client';

export const FIND_MANY_SERVERLESS_FUNCTIONS = gql`
  query GetManyServerlessFunctions {
    serverlessFunctions(paging: { first: 1000 }) {
      edges {
        node {
          id
          name
          sourceCodeHash
          sourceCodeFullPath
          runtime
          syncStatus
          createdAt
          updatedAt
        }
      }
    }
  }
`;
