import { gql } from '@apollo/client';

export const GET_ENVIRONMENT_VARIABLES_GROUPED = gql`
  query GetEnvironmentVariablesGrouped($includeSensitive: Boolean! = false) {
    getEnvironmentVariablesGrouped(includeSensitive: $includeSensitive) {
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
