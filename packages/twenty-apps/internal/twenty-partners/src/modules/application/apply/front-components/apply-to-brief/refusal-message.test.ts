import { describe, expect, it } from 'vitest';

import {
  GENERIC_APPLY_FAILURE_MESSAGE,
  getRefusalMessage,
} from './refusal-message';

describe('getRefusalMessage', () => {
  it('maps every known reason to its own plain sentence', () => {
    expect(getRefusalMessage('UNAUTHENTICATED')).toBe(
      'Sign in again to apply.',
    );
    expect(getRefusalMessage('NO_PARTNER')).toBe(
      'This account is not linked to a partner.',
    );
    expect(getRefusalMessage('BAD_REQUEST')).toBe(
      'Reopen this brief and try again.',
    );
    expect(getRefusalMessage('BRIEF_NOT_OPEN')).toBe(
      'This brief is no longer open for applications.',
    );
    expect(getRefusalMessage('PITCH_TOO_SHORT')).toBe(
      'Add a little more detail before you apply.',
    );
    expect(getRefusalMessage('ALREADY_APPLIED')).toBe(
      'You have already applied to this brief.',
    );
  });

  it('falls back to the generic sentence for an unknown reason', () => {
    expect(getRefusalMessage('SOMETHING_NEW')).toBe(
      GENERIC_APPLY_FAILURE_MESSAGE,
    );
    expect(getRefusalMessage('')).toBe(GENERIC_APPLY_FAILURE_MESSAGE);
  });
});
