import { describe, expect, it } from 'vitest';

import { buildAllowedValues } from 'src/logic-functions/utils/build-allowed-values';

describe('buildAllowedValues', () => {
  it('builds a set of the option values', () => {
    const allowed = buildAllowedValues([
      { key: 'a', value: 'A', label: 'A', color: 'blue', position: 0 },
      { key: 'b', value: 'B', label: 'B', color: 'red', position: 1 },
    ]);

    expect(allowed.has('A')).toBe(true);
    expect(allowed.has('B')).toBe(true);
    expect(allowed.size).toBe(2);
  });
});
