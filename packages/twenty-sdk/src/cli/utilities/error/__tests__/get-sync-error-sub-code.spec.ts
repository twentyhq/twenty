import { describe, expect, it } from 'vitest';

import { getSyncErrorSubCode } from '@/cli/utilities/error/get-sync-error-sub-code';

describe('getSyncErrorSubCode', () => {
  it('returns the sub code carried by the error extensions', () => {
    expect(getSyncErrorSubCode({ subCode: 'APP_NOT_INSTALLED' })).toBe(
      'APP_NOT_INSTALLED',
    );
  });

  it('returns undefined when the extensions carry no sub code', () => {
    expect(getSyncErrorSubCode({ code: 'CONFLICT' })).toBeUndefined();
  });

  it('returns undefined for an empty sub code', () => {
    expect(getSyncErrorSubCode({ subCode: '' })).toBeUndefined();
  });

  it('returns undefined for a sub code that is not a string', () => {
    expect(getSyncErrorSubCode({ subCode: 42 })).toBeUndefined();
  });

  it.each([undefined, null, 'CONFLICT', ['CONFLICT']])(
    'returns undefined for %p',
    (error) => {
      expect(getSyncErrorSubCode(error)).toBeUndefined();
    },
  );
});
