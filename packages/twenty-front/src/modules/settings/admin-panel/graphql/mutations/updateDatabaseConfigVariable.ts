import { gql } from '@apollo/client';

export const UPDATE_DATABASE_CONFIG_VARIABLE = gql`
  mutation UpdateDatabaseConfigVariable($key: String!, $value: String!) {
    updateDatabaseConfigVariable(key: $key, value: $value)
  }
`;
