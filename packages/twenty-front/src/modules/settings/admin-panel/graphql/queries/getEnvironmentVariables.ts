import { gql } from '@apollo/client';

export const GET_ENVIRONMENT_VARIABLES = gql`
  query GetEnvironmentVariables($includeSensitive: Boolean! = false) {
    getEnvironmentVariables(includeSensitive: $includeSensitive) {
      groups {
        groupName
        standalone {
          name
          description
          value
          sensitive
        }
        subgroups {
          subgroupName
          variables {
            name
            description
            value
            sensitive
          }
        }
      }
    }
  }
`;
