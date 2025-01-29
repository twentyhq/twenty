import { gql } from '@apollo/client';

export const GET_ENVIRONMENT_VARIABLES = gql`
  query GetEnvironmentVariables {
    getEnvironmentVariables {
      variables {
        key
        value
        metadata {
          group
          subGroup
          description
          sensitive
        }
      }
    }
  }
`;
