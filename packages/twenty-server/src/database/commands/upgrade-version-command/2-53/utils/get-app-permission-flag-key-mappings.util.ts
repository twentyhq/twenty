import { APP_PERMISSION_FLAG_KEY_RENAMES } from 'src/database/commands/upgrade-version-command/2-53/constants/app-permission-flag-key-renames.constant';
import { type PermissionFlagKeyRename } from 'src/database/commands/upgrade-version-command/2-53/types/permission-flag-key-rename.type';

export const getAppPermissionFlagKeyMappings = (
  direction: 'up' | 'down',
): Omit<PermissionFlagKeyRename, 'permissionFlagId'>[] =>
  APP_PERMISSION_FLAG_KEY_RENAMES.map(
    ({ universalIdentifier, previousKey, nextKey }) => ({
      universalIdentifier,
      fromKey: direction === 'up' ? previousKey : nextKey,
      toKey: direction === 'up' ? nextKey : previousKey,
    }),
  );
