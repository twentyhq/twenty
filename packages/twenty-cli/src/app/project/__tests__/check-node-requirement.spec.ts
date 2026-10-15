import { describe, expect, it } from 'vitest';

import { checkNodeRequirement } from '@/app/project/check-node-requirement';

describe('checkNodeRequirement', () => {
  it.each([
    ['24.5.0', '^24.5.0', 'satisfied'],
    ['24.4.9', '^24.5.0', 'belowMinimum'],
    ['24.5.0', '24', 'satisfied'],
    ['24.5.0', '<=24', 'satisfied'],
    ['24.5.0', '99.x', 'belowMinimum'],
    ['24.5.0', '>= 99.0.0', 'belowMinimum'],
    ['24.5.0', '20 - 24', 'satisfied'],
    ['24.5.0', '^20 || ^24', 'satisfied'],
    ['26.0.0', '^24.5.0', 'outsideRange'],
    ['25.0.0', '<=24', 'outsideRange'],
    ['23.1.0', '^22 || ^24', 'outsideRange'],
    ['24.5.0', 'latest', 'invalid'],
  ])('checks Node %s against %j', (version, range, expected) => {
    expect(checkNodeRequirement({ version, range })).toBe(expected);
  });
});
