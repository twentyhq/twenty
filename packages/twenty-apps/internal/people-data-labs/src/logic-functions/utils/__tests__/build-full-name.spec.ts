import { describe, expect, it } from 'vitest';

import { buildFullName } from 'src/logic-functions/utils/build-full-name';

describe('buildFullName', () => {
  it('uses explicit first and last name when present', () => {
    expect(buildFullName('Jane', 'Doe', undefined)).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });

  it('fills only the part that is present', () => {
    expect(buildFullName('Jane', undefined, undefined)).toEqual({
      firstName: 'Jane',
      lastName: '',
    });
  });

  it('splits a full name on the first whitespace run', () => {
    expect(buildFullName(undefined, undefined, 'Jane Mary Doe')).toEqual({
      firstName: 'Jane',
      lastName: 'Mary Doe',
    });
  });

  it('returns undefined when there is no name', () => {
    expect(buildFullName(undefined, undefined, undefined)).toBeUndefined();
  });
});
