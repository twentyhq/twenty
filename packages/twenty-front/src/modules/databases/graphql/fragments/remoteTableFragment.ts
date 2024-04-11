import { gql } from '@apollo/client';

export const REMOTE_TABLE_FRAGMENT = gql`
  fragment RemoteTableFields on RemoteTable {
    name
    schema
    status
  }
`;
