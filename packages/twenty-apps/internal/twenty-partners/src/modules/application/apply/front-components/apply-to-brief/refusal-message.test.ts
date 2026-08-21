import { describe, expect, it } from 'vitest';

import { GENERIC_APPLY_FAILURE_MESSAGE, getRefusalMessage } from './refusal-message';

describe('getRefusalMessage', () => {
  it('maps every known reason to a plain sentence that hides the code', () => {
    const reasons = [
      'UNAUTHENTICATED',
      'NO_PARTNER',
      'BRIEF_NOT_OPEN',
      'PITCH_TOO_SHORT',
      'ALREADY_APPLIED',
    ];

    for (const reason of reasons) {
      const message = getRefusalMessage(reason);

      expect(message).not.toBe(GENERIC_APPLY_FAILURE_MESSAGE);
      expect(message).not.toContain(reason);
      expect(message.endsWith('.')).toBe(true);
    }
  });

  it('falls back to the generic sentence for an unknown reason', () => {
    expect(getRefusalMessage('SOMETHING_NEW')).toBe(GENERIC_APPLY_FAILURE_MESSAGE);
    expect(getRefusalMessage('')).toBe(GENERIC_APPLY_FAILURE_MESSAGE);
  });
});
