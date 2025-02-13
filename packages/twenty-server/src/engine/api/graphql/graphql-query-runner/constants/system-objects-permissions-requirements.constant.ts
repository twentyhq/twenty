import { SettingsFeatures } from 'twenty-shared';

export const SYSTEM_OBJECTS_PERMISSIONS_REQUIREMENTS = {
  apiKey: SettingsFeatures.API_KEYS_AND_WEBHOOKS,
  webhook: SettingsFeatures.API_KEYS_AND_WEBHOOKS,
} as const;
