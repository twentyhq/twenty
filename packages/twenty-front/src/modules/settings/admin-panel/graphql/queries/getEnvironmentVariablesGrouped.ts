import { gql } from '@apollo/client';

export const GET_ENVIRONMENT_VARIABLES_GROUPED = gql`
  query GetEnvironmentVariablesGrouped {
    getEnvironmentVariablesGrouped {
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
