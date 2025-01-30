import { gql } from '@apollo/client';

export const GET_ENVIRONMENT_VARIABLES = gql`
  query GetEnvironmentVariables {
    getEnvironmentVariables {
      groups {
        groupName
        standalone {
          name
          description
          value
        }
        subgroups {
          subgroupName
          variables {
            name
            description
            value
          }
        }
      }
    }
  }
`;
