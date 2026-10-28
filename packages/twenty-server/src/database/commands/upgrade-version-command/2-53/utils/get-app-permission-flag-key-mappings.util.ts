import { APP_PERMISSION_FLAG_KEY_RENAMES } from 'src/database/commands/upgrade-version-command/2-53/constants/app-permission-flag-key-renames.constant';

export const getAppPermissionFlagKeyMappings = (
  direction: 'up' | 'down',
): { universalIdentifier: string; fromKey: string; toKey: string }[] =>
  APP_PERMISSION_FLAG_KEY_RENAMES.map(
    ({ universalIdentifier, previousKey, nextKey }) => ({
      universalIdentifier,
      fromKey: direction === 'up' ? previousKey : nextKey,
      toKey: direction === 'up' ? nextKey : previousKey,
    }),
  );
