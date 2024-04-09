import { gql } from '@apollo/client';

import { DATABASE_CONNECTION_FRAGMENT } from '@/databases/graphql/fragments/databaseConnectionFragment';

export const CREATE_ONE_DATABASE_CONNECTION = gql`
  ${DATABASE_CONNECTION_FRAGMENT}
  mutation createServer($input: CreateRemoteServerInput!) {
    createOneRemoteServer(input: $input) {
      ...RemoteServerFields
    }
  }
`;
