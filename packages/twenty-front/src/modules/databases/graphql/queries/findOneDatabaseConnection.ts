import { gql } from '@apollo/client';

import { DATABASE_CONNECTION_FRAGMENT } from '@/databases/graphql/fragments/databaseConnectionFragment';

export const GET_ONE_DATABASE_CONNECTION = gql`
  ${DATABASE_CONNECTION_FRAGMENT}
  query GetOneDatabaseConnection($input: RemoteServerIdInput!) {
    findOneRemoteServerById(input: $input) {
      ...RemoteServerFields
    }
  }
`;
