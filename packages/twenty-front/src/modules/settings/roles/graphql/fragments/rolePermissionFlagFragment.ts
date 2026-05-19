import { gql } from '@apollo/client';

export const ROLE_PERMISSION_FLAG_FRAGMENT = gql`
  fragment RolePermissionFlagFragment on RolePermissionFlag {
    id
    flag
    roleId
  }
`;
