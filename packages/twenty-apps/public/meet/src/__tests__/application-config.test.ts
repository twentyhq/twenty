import { describe, expect, it } from 'vitest';

import * as identifiers from 'src/constants/universal-identifiers';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('application identifiers', () => {
  it('uses distinct UUID v4 identifiers for every manifest entity', () => {
    const universalIdentifiers = Object.entries(identifiers)
      .filter(([name]) => name.endsWith('_UNIVERSAL_IDENTIFIER'))
      .map(([, value]) => value);

    expect(new Set(universalIdentifiers).size).toBe(
      universalIdentifiers.length,
    );

    for (const universalIdentifier of universalIdentifiers) {
      expect(universalIdentifier).toMatch(UUID_V4_PATTERN);
    }
  });
});
