import { describe, expect, it } from 'vitest';

import { checkNodeRequirement } from '@/app/project/check-node-requirement';

describe('checkNodeRequirement', () => {
  it.each([
    ['24.5.0', '^24.5.0', 'satisfied'],
    ['24.4.9', '^24.5.0', 'unsatisfied'],
    ['24.5.0', '24', 'satisfied'],
    ['24.5.0', '<=24', 'satisfied'],
    ['24.5.0', '99.x', 'unsatisfied'],
    ['24.5.0', '>= 99.0.0', 'unsatisfied'],
    ['24.5.0', '20 - 24', 'satisfied'],
    ['24.5.0', '^20 || ^24', 'satisfied'],
    ['24.5.0', 'latest', 'invalid'],
  ])('checks Node %s against %j', (version, range, expected) => {
    expect(checkNodeRequirement({ version, range })).toBe(expected);
  });
});
