import { describe, expect, it } from 'vitest';

import { buildPhones } from 'src/logic-functions/utils/build-phones';

describe('buildPhones', () => {
  it('uses the first present number as the primary phone', () => {
    expect(buildPhones([null, '', '+15551234'])).toEqual({
      primaryPhoneNumber: '+15551234',
      primaryPhoneCountryCode: '',
      primaryPhoneCallingCode: '',
      additionalPhones: null,
    });
  });

  it('returns undefined when there is no number', () => {
    expect(buildPhones([null, undefined])).toBeUndefined();
  });
});
