import { gql } from '@apollo/client';

import { DATABASE_CONNECTION_FRAGMENT } from '@/databases/graphql/fragments/databaseConnectionFragment';

export const UPDATE_ONE_DATABASE_CONNECTION = gql`
  ${DATABASE_CONNECTION_FRAGMENT}
  mutation updateServer($input: UpdateRemoteServerInput!) {
    updateOneRemoteServer(input: $input) {
      ...RemoteServerFields
    }
  }
`;
