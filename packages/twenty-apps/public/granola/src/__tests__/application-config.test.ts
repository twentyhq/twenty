import { describe, expect, it } from 'vitest';
import * as identifiers from 'src/constants/universal-identifiers';

describe('application identifiers', () => {
  it('uses distinct UUID v4 identifiers for every manifest entity', () => {
    const values = Object.entries(identifiers)
      .filter(([name]) => name.endsWith('_UNIVERSAL_IDENTIFIER'))
      .map(([, value]) => value);
    expect(new Set(values).size).toBe(values.length);
    for (const value of values) {
      expect(value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    }
  });
});
