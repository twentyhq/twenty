import { gql } from '@apollo/client';

export const GET_ENVIRONMENT_VARIABLES_GROUPED = gql`
  query GetEnvironmentVariablesGrouped {
    getEnvironmentVariablesGrouped {
      groups {
        name
        description
        isHiddenOnLoad
        variables {
          name
          description
          value
          sensitive
        }
      }
    }
  }
`;
