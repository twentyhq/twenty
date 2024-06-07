import { gql } from '@apollo/client';

export const REMOTE_TABLE_FRAGMENT = gql`
  fragment RemoteTableFields on RemoteTable {
    id
    name
    schema
    status
    schemaPendingUpdates
  }
`;
