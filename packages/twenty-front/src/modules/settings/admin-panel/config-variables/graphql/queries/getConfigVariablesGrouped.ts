import { gql } from '@apollo/client';

export const GET_CONFIG_VARIABLES_GROUPED = gql`
  query GetConfigVariablesGrouped {
    getConfigVariablesGrouped {
      groups {
        name
        description
        isHiddenOnLoad
        variables {
          name
          description
          value
          isSensitive
          isEnvOnly
          type
          options
          source
        }
      }
    }
  }
`;
