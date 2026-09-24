import { WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';
import { describe, expect, it } from 'vitest';

import { getSyncErrorRecoveryHint } from '@/cli/utilities/error/get-sync-error-recovery-hint';

describe('getSyncErrorRecoveryHint', () => {
  it('suggests an initial sync when the app is not installed', () => {
    const hint = getSyncErrorRecoveryHint({
      message:
        'Application "x" is not installed in workspace "y". Install it first.',
    });

    expect(hint).toContain('yarn twenty dev --once');
    expect(hint).toContain('register');
  });

  it('suggests previewing and reinstalling on a metadata conflict', () => {
    const hint = getSyncErrorRecoveryHint({
      message:
        "Migration action 'create' for 'fieldMetadata' (universalIdentifier: 2020) failed",
    });

    expect(hint).toContain('yarn twenty dev --once --dry-run');
    expect(hint).toContain('yarn twenty app:uninstall -y');
  });

  it('suggests previewing on an already-exists error', () => {
    const hint = getSyncErrorRecoveryHint({
      message: 'Field with same universal identifier already exists in object',
    });

    expect(hint).toContain('yarn twenty dev --once --dry-run');
  });

  it('tells the user to wait when a deferred data model change is still running', () => {
    const hint = getSyncErrorRecoveryHint({
      message: '4 deferred schema action(s) are still running on workspace x',
      subCode:
        WorkspaceMigrationV2ExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
    });

    expect(hint).toContain('still being applied in the background');
  });

  it('returns undefined for an unrecognized error', () => {
    expect(
      getSyncErrorRecoveryHint({ message: 'Network request failed' }),
    ).toBeUndefined();
    expect(getSyncErrorRecoveryHint({ message: undefined })).toBeUndefined();
  });
});
