import { SettingsPermissions } from 'src/engine/metadata-modules/permissions/constants/settings-permissions.constants';

export const SYSTEM_OBJECTS_PERMISSIONS_REQUIREMENTS = {
  apiKey: SettingsPermissions.API_KEYS_AND_WEBHOOKS,
  webhook: SettingsPermissions.API_KEYS_AND_WEBHOOKS,
} as const;
