import { gql } from '@apollo/client';

export const SETTING_PERMISSION_FRAGMENT = gql`
  fragment SettingPermissionFragment on SettingPermission {
    id
    setting
    roleId
  }
`;
