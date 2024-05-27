import { gql } from '@apollo/client';

import { REMOTE_TABLE_FRAGMENT } from '@/databases/graphql/fragments/remoteTableFragment';

export const GET_MANY_REMOTE_TABLES = gql`
  ${REMOTE_TABLE_FRAGMENT}
  query GetManyRemoteTables($input: FindManyRemoteTablesInput!) {
    findDistantTablesWithStatus(input: $input) {
      ...RemoteTableFields
    }
  }
`;
