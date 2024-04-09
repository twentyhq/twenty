import { gql } from '@apollo/client';

export const GET_MANY_DATABASE_CONNECTION_TABLES = gql`
  query GetManyDatabaseConnectionTables($input: RemoteServerIdInput!) {
    findAvailableRemoteTablesByServerId(input: $input) {
      name
      schema
      status
    }
  }
`;
