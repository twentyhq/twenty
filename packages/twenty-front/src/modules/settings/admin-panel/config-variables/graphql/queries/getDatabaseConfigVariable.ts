import { gql } from '@apollo/client';

export const GET_DATABASE_CONFIG_VARIABLE = gql`
  query GetDatabaseConfigVariable($key: String!) {
    getDatabaseConfigVariable(key: $key) {
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
`;
