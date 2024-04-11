import { gql } from '@apollo/client';

import { DATABASE_CONNECTION_FRAGMENT } from '@/databases/graphql/fragments/databaseConnectionFragment';

export const GET_MANY_DATABASE_CONNECTIONS = gql`
  ${DATABASE_CONNECTION_FRAGMENT}
  query GetManyDatabaseConnections($input: RemoteServerTypeInput!) {
    findManyRemoteServersByType(input: $input) {
      ...RemoteServerFields
    }
  }
`;
