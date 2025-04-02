import { gql } from '@apollo/client';

export const UPDATE_CONFIG_VAR = gql`
  mutation UpdateConfigVar($input: UpdateConfigVarInput!) {
    updateConfigVar(input: $input) {
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
