import { describe, expect, it } from 'vitest';

import { getSyncErrorRecoveryHint } from '@/cli/utilities/error/get-sync-error-recovery-hint';

describe('getSyncErrorRecoveryHint', () => {
  it('suggests an initial sync when the app is not installed', () => {
    const hint = getSyncErrorRecoveryHint(
      'Application "x" is not installed in workspace "y". Install it first.',
    );

    expect(hint).toContain('yarn twenty dev --once');
    expect(hint).toContain('register');
  });

  it('suggests previewing and reinstalling on a metadata conflict', () => {
    const hint = getSyncErrorRecoveryHint(
      "Migration action 'create' for 'fieldMetadata' (universalIdentifier: 2020) failed",
    );

    expect(hint).toContain('yarn twenty dev --once --dry-run');
    expect(hint).toContain('yarn twenty app:uninstall -y');
  });

  it('suggests previewing on an already-exists error', () => {
    const hint = getSyncErrorRecoveryHint(
      'Field with same universal identifier already exists in object',
    );

    expect(hint).toContain('yarn twenty dev --once --dry-run');
  });

  it('returns undefined for an unrecognized error', () => {
    expect(getSyncErrorRecoveryHint('Network request failed')).toBeUndefined();
    expect(getSyncErrorRecoveryHint(undefined)).toBeUndefined();
  });

  it('mentions auto-adoption for viewField conflicts (#23192)', () => {
    const hint = getSyncErrorRecoveryHint(
      "Migration action 'create' for 'viewField' (universalIdentifier: 2020) failed",
    );

    expect(hint).toContain('viewField');
    expect(hint).toContain('auto-adopted');
  });

  it('mentions auto-adoption for viewFilter / viewSort / viewFieldGroup conflicts', () => {
    for (const message of [
      "Migration action 'create' for 'viewFilter' (universalIdentifier: a) failed",
      "Migration action 'create' for 'viewSort' (universalIdentifier: b) failed",
      "Migration action 'create' for 'viewFieldGroup' (universalIdentifier: c) failed",
      'View field metadata with this universal identifier already exists',
    ]) {
      const hint = getSyncErrorRecoveryHint(message);

      expect(hint).toContain('auto-adopted');
    }
  });

  it('still suggests uninstall for non-view-structure conflicts', () => {
    const hint = getSyncErrorRecoveryHint(
      "Migration action 'create' for 'fieldMetadata' (universalIdentifier: 2020) failed",
    );

    expect(hint).toContain('yarn twenty app:uninstall -y');
    expect(hint).not.toContain('auto-adopted');
  });
});
