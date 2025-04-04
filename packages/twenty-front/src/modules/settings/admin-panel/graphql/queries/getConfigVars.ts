import { gql } from '@apollo/client';

export const GET_CONFIG_VARS = gql`
  query ConfigVars {
    configVars {
      key
      value
      source
      metadata {
        group
        description
        sensitive
        isEnvOnly
      }
    }
  }
`;
