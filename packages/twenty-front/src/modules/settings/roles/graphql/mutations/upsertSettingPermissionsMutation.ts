import { PERMISSION_FLAG_FRAGMENT } from '@/settings/roles/graphql/fragments/permissionFlagFragment';
import { gql } from '@apollo/client';

export const UPSERT_SETTING_PERMISSIONS = gql`
  ${PERMISSION_FLAG_FRAGMENT}
  mutation UpsertSettingPermissions(
    $upsertSettingPermissionsInput: UpsertPermissionFlagsInput!
  ) {
    upsertSettingPermissions(
      upsertSettingPermissionsInput: $upsertSettingPermissionsInput
    ) {
      ...PermissionFlagFragment
    }
  }
`;
