import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';

export const OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS = {
  apiKey: SettingPermissionType.API_KEYS_AND_WEBHOOKS,
  webhook: SettingPermissionType.API_KEYS_AND_WEBHOOKS,
} as const;
