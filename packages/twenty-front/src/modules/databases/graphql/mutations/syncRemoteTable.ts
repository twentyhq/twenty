import { gql } from '@apollo/client';

import { REMOTE_TABLE_FRAGMENT } from '@/databases/graphql/fragments/remoteTableFragment';

export const SYNC_REMOTE_TABLE = gql`
  ${REMOTE_TABLE_FRAGMENT}
  mutation syncRemoteTable($input: RemoteTableInput!) {
    syncRemoteTable(input: $input) {
      ...RemoteTableFields
    }
  }
`;
