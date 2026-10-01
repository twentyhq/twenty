import { describe, expect, it } from 'vitest';

import { isPdlAccountErrorOutcome } from 'src/logic-functions/utils/is-pdl-account-error-outcome';

describe('isPdlAccountErrorOutcome', () => {
  it.each([401, 402])('flags an HTTP %i error', (httpStatus) => {
    expect(
      isPdlAccountErrorOutcome({
        outcome: 'error',
        httpStatus,
        message: 'rejected',
      }),
    ).toBe(true);
  });

  it.each([429, 500])('does not flag an HTTP %i error', (httpStatus) => {
    expect(
      isPdlAccountErrorOutcome({
        outcome: 'error',
        httpStatus,
        message: 'boom',
      }),
    ).toBe(false);
  });

  it('does not flag a matched outcome', () => {
    expect(
      isPdlAccountErrorOutcome({
        outcome: 'matched',
        httpStatus: 200,
        data: { id: 'a' },
      }),
    ).toBe(false);
  });

  it('does not flag a missing outcome', () => {
    expect(isPdlAccountErrorOutcome(undefined)).toBe(false);
  });
});
