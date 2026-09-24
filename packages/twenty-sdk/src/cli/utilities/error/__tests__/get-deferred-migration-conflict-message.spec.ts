import { WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';
import { describe, expect, it } from 'vitest';

import { getDeferredMigrationConflictMessage } from '@/cli/utilities/error/get-deferred-migration-conflict-message';

const DEFERRED_SUB_CODE =
  WorkspaceMigrationV2ExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS;

describe('getDeferredMigrationConflictMessage', () => {
  it('returns the user friendly message the server sent', () => {
    expect(
      getDeferredMigrationConflictMessage({
        subCode: DEFERRED_SUB_CODE,
        userFriendlyMessage: 'Still applying your previous change.',
      }),
    ).toBe('Still applying your previous change.');
  });

  it('falls back to its own message when the server sent none', () => {
    expect(
      getDeferredMigrationConflictMessage({ subCode: DEFERRED_SUB_CODE }),
    ).toBe(
      'A previous data model change is still being applied in the background.',
    );
  });

  it('falls back when the user friendly message is empty', () => {
    expect(
      getDeferredMigrationConflictMessage({
        subCode: DEFERRED_SUB_CODE,
        userFriendlyMessage: '',
      }),
    ).toBe(
      'A previous data model change is still being applied in the background.',
    );
  });

  it('returns undefined for another sub code', () => {
    expect(
      getDeferredMigrationConflictMessage({ subCode: 'APP_NOT_INSTALLED' }),
    ).toBeUndefined();
  });

  it('returns undefined when there is no error payload', () => {
    expect(getDeferredMigrationConflictMessage(undefined)).toBeUndefined();
  });
});
