import { gql } from '@apollo/client';

import { REMOTE_TABLE_FRAGMENT } from '@/databases/graphql/fragments/remoteTableFragment';

export const SYNC_REMOTE_TABLE_SCHEMA_CHANGES = gql`
  ${REMOTE_TABLE_FRAGMENT}
  mutation syncRemoteTableSchemaChanges($input: RemoteTableInput!) {
    syncRemoteTableSchemaChanges(input: $input) {
      ...RemoteTableFields
    }
  }
`;
