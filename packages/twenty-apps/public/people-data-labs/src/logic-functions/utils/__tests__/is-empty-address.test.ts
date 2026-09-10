import { describe, expect, it } from 'vitest';

import { isEmptyAddress } from 'src/logic-functions/utils/is-empty-address';

describe('isEmptyAddress', () => {
  it('is true when every address text field is empty or missing', () => {
    expect(isEmptyAddress(null)).toBe(true);
    expect(
      isEmptyAddress({
        addressStreet1: '',
        addressCity: '   ',
        addressCountry: '',
      }),
    ).toBe(true);
  });

  it('is false when at least one address field is present', () => {
    expect(isEmptyAddress({ addressCity: 'San Francisco' })).toBe(false);
  });
});
