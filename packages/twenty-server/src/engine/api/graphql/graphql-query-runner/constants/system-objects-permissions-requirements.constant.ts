import { SettingsPermissions } from 'twenty-shared';

export const SYSTEM_OBJECTS_PERMISSIONS_REQUIREMENTS = {
  apiKey: SettingsPermissions.API_KEYS_AND_WEBHOOKS,
  webhook: SettingsPermissions.API_KEYS_AND_WEBHOOKS,
} as const;
