import { describe, expect, it } from 'vitest';

import { findPdlAccountErrorMessage } from 'src/logic-functions/utils/find-pdl-account-error-message';

describe('findPdlAccountErrorMessage', () => {
  it.each([401, 402])(
    'returns the message when every outcome is an HTTP %i error',
    (httpStatus) => {
      expect(
        findPdlAccountErrorMessage([
          { outcome: 'error', httpStatus, message: 'Account error' },
          { outcome: 'error', httpStatus, message: 'Account error' },
        ]),
      ).toBe('Account error');
    },
  );

  it('returns undefined when some outcomes are not account errors', () => {
    expect(
      findPdlAccountErrorMessage([
        { outcome: 'error', httpStatus: 401, message: 'Invalid API key' },
        { outcome: 'matched', httpStatus: 200, data: { id: 'a' } },
      ]),
    ).toBeUndefined();
  });

  it('returns undefined for errors that are not about the account', () => {
    expect(
      findPdlAccountErrorMessage([
        { outcome: 'error', httpStatus: 429, message: 'Rate limited' },
        { outcome: 'error', httpStatus: 500, message: 'boom' },
      ]),
    ).toBeUndefined();
  });

  it('returns undefined when there are no outcomes', () => {
    expect(findPdlAccountErrorMessage([])).toBeUndefined();
  });
});
