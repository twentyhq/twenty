import { describe, expect, it } from 'vitest';

import * as all from 'src/constants/universal-identifiers';

describe('universal-identifiers', () => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Only test string values that look like UUIDs (dash-separated hex).
  const uuids: string[] = [];
  for (const [, value] of Object.entries(all)) {
    if (typeof value === 'string' && uuidRegex.test(value)) {
      uuids.push(value);
    }
  }

  it('every UUID-formatted constant is a valid UUID v4', () => {
    const invalid: string[] = [];
    for (const uuid of uuids) {
      if (!uuidV4Regex.test(uuid)) {
        invalid.push(uuid);
      }
    }
    expect(invalid).toEqual([]);
  });

  it('no duplicate UUIDs', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const uuid of uuids) {
      if (seen.has(uuid)) {
        dupes.push(uuid);
      }
      seen.add(uuid);
    }
    expect(dupes).toEqual([]);
  });
});
