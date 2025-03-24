import { Setting } from 'src/engine/metadata-modules/permissions/constants/setting.constants';

export const SYSTEM_OBJECTS_PERMISSIONS_REQUIREMENTS = {
  apiKey: Setting.API_KEYS_AND_WEBHOOKS,
  webhook: Setting.API_KEYS_AND_WEBHOOKS,
} as const;
