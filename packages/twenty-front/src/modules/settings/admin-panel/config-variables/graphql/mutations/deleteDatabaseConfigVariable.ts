import { gql } from '@apollo/client';

export const DELETE_DATABASE_CONFIG_VARIABLE = gql`
  mutation DeleteDatabaseConfigVariable($key: String!) {
    deleteDatabaseConfigVariable(key: $key)
  }
`;
