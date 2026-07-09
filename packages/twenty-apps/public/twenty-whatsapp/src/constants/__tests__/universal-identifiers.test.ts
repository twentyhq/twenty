import { describe, expect, it } from 'vitest';

import { WHATSAPP_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('universal-identifier registry', () => {
  const registryUuids = Object.values(WHATSAPP_UNIVERSAL_IDENTIFIERS);

  it('contains only valid v4 UUIDs', () => {
    expect(registryUuids.filter((uuid) => !UUID_V4_REGEX.test(uuid))).toEqual(
      [],
    );
  });

  it('contains no duplicate UUIDs across the whole registry', () => {
    expect(new Set(registryUuids).size).toBe(registryUuids.length);
  });
});
