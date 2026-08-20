import { describe, expect, it } from 'vitest';

import { isEmptyFullName } from 'src/logic-functions/utils/is-empty-full-name';

describe('isEmptyFullName', () => {
  it('is true when both first and last name are empty or missing', () => {
    expect(isEmptyFullName(null)).toBe(true);
    expect(isEmptyFullName({ firstName: '', lastName: '' })).toBe(true);
  });

  it('is false when at least one name part is present', () => {
    expect(isEmptyFullName({ firstName: 'Jane', lastName: '' })).toBe(false);
  });
});
