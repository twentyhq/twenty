import { describe, expect, it } from 'vitest';

import { buildFullName } from 'src/logic-functions/utils/build-full-name';

describe('buildFullName', () => {
  it('uses explicit first and last name when present', () => {
    expect(
      buildFullName({ firstName: 'Jane', lastName: 'Doe', fullName: undefined }),
    ).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });

  it('fills only the part that is present', () => {
    expect(
      buildFullName({ firstName: 'Jane', lastName: undefined, fullName: undefined }),
    ).toEqual({
      firstName: 'Jane',
      lastName: '',
    });
  });

  it('splits a full name on the first whitespace run', () => {
    expect(
      buildFullName({
        firstName: undefined,
        lastName: undefined,
        fullName: 'Jane Mary Doe',
      }),
    ).toEqual({
      firstName: 'Jane',
      lastName: 'Mary Doe',
    });
  });

  it('capitalizes lowercase names returned by PDL', () => {
    expect(
      buildFullName({ firstName: 'sean', lastName: 'thorne', fullName: undefined }),
    ).toEqual({
      firstName: 'Sean',
      lastName: 'Thorne',
    });
  });

  it('capitalizes a lowercase full name when split', () => {
    expect(
      buildFullName({
        firstName: undefined,
        lastName: undefined,
        fullName: 'sean fong thorne',
      }),
    ).toEqual({
      firstName: 'Sean',
      lastName: 'Fong Thorne',
    });
  });

  it('returns undefined when there is no name', () => {
    expect(
      buildFullName({ firstName: undefined, lastName: undefined, fullName: undefined }),
    ).toBeUndefined();
  });
});
