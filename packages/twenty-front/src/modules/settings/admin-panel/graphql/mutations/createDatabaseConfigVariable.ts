import { gql } from '@apollo/client';

export const CREATE_DATABASE_CONFIG_VARIABLE = gql`
  mutation CreateDatabaseConfigVariable($key: String!, $value: String!) {
    createDatabaseConfigVariable(key: $key, value: $value)
  }
`;
