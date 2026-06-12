import { describe, expect, it } from 'vitest';

import { toErrorMessage } from 'src/utils/to-error-message';

describe('toErrorMessage', () => {
  it('returns the message of an Error', () => {
    expect(toErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('stringifies a non-Error value', () => {
    expect(toErrorMessage('oops')).toBe('oops');
  });
});
