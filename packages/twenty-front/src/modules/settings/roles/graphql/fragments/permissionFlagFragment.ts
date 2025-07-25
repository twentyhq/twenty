import { gql } from '@apollo/client';

export const PERMISSION_FLAG_FRAGMENT = gql`
  fragment PermissionFlagFragment on PermissionFlag {
    id
    flag
    roleId
  }
`;
