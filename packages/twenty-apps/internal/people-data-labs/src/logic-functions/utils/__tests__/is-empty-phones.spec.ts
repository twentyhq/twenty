import { describe, expect, it } from 'vitest';

import { isEmptyPhones } from 'src/logic-functions/utils/is-empty-phones';

describe('isEmptyPhones', () => {
  it('is true when there is no primary phone number', () => {
    expect(isEmptyPhones(null)).toBe(true);
    expect(isEmptyPhones({ primaryPhoneNumber: '' })).toBe(true);
  });

  it('is false when a primary phone number is present', () => {
    expect(isEmptyPhones({ primaryPhoneNumber: '5551234' })).toBe(false);
  });
});
