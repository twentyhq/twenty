import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

export const OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS = {
  apiKey: PermissionFlagType.API_KEYS_AND_WEBHOOKS,
  webhook: PermissionFlagType.API_KEYS_AND_WEBHOOKS,
} as const;
