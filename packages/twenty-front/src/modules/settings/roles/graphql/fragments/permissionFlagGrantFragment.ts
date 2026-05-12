import { gql } from '@apollo/client';

export const PERMISSION_FLAG_GRANT_FRAGMENT = gql`
  fragment PermissionFlagGrantFragment on PermissionFlagGrant {
    id
    flag
    roleId
  }
`;
