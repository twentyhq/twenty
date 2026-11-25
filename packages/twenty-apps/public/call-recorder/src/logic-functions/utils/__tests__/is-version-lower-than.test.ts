import { describe, expect, it } from 'vitest';

import { isVersionLowerThan } from 'src/logic-functions/utils/is-version-lower-than.util';

describe('isVersionLowerThan', () => {
  it.each([
    ['1.19.0', '1.20.0', true],
    ['1.9.9', '1.20.0', true],
    ['0.30.0', '1.20.0', true],
    ['1.20.0', '1.20.0', false],
    ['1.20.1', '1.20.0', false],
    ['2.0.0', '1.20.0', false],
    ['1.20.0-rc.1', '1.20.0', false],
    ['1.19', '1.20.0', true],
  ])('compares %s with %s', (version, targetVersion, expected) => {
    expect(isVersionLowerThan({ version, targetVersion })).toBe(expected);
  });
});
