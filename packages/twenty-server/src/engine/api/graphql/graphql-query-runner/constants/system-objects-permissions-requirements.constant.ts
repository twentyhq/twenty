import { SettingPermission } from 'src/engine/metadata-modules/permissions/constants/setting-permission.constants';

export const SYSTEM_OBJECTS_PERMISSIONS_REQUIREMENTS = {
  apiKey: SettingPermission.API_KEYS_AND_WEBHOOKS,
  webhook: SettingPermission.API_KEYS_AND_WEBHOOKS,
} as const;
