import { isNonEmptyString } from '@sniptt/guards';
import { WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';
import { isPlainObject } from 'twenty-shared/utils';

import { getSyncErrorSubCode } from '@/cli/utilities/error/get-sync-error-sub-code';

const DEFAULT_MESSAGE =
  'A previous data model change is still being applied in the background.';

export const getDeferredMigrationConflictMessage = (
  error: unknown,
): string | undefined => {
  if (
    getSyncErrorSubCode(error) !==
    WorkspaceMigrationV2ExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS
  ) {
    return undefined;
  }

  if (isPlainObject(error) && isNonEmptyString(error.userFriendlyMessage)) {
    return error.userFriendlyMessage;
  }

  return DEFAULT_MESSAGE;
};
