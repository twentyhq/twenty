import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionKeys';

export const getObjectDisabledOperations = (
  objectMetadataItem:
    | Pick<EnrichedObjectMetadataItem, 'disabledObjectPermissionActions'>
    | undefined,
): SettingsRoleObjectPermissionKey[] =>
  SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.filter((operation) =>
    objectMetadataItem?.disabledObjectPermissionActions?.includes(operation),
  );
