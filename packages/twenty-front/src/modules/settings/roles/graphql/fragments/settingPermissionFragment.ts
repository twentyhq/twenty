import { gql } from '@apollo/client';

export const SETTING_PERMISSION_FRAGMENT = gql`
  fragment SettingPermissionFragment on PermissionFlag {
    id
    permissionFlag
    roleId
  }
`;
