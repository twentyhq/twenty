import { gql } from '@apollo/client';

import { REMOTE_TABLE_FRAGMENT } from '@/databases/graphql/fragments/remoteTableFragment';

export const UNSYNC_REMOTE_TABLE = gql`
  ${REMOTE_TABLE_FRAGMENT}
  mutation unsyncRemoteTable($input: RemoteTableInput!) {
    unsyncRemoteTable(input: $input) {
      ...RemoteTableFields
    }
  }
`;
