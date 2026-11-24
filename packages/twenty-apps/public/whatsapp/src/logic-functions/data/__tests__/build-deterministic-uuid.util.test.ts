import { describe, expect, it } from 'vitest';
import { buildDeterministicUuid } from 'src/logic-functions/data/build-deterministic-uuid.util';

describe('buildDeterministicUuid', () => {
  it('should return the same valid v4 UUID for the same seed', () => {
    const uuid = buildDeterministicUuid('whatsapp-campaign:member-1:request-1');

    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(buildDeterministicUuid('whatsapp-campaign:member-1:request-1')).toBe(uuid);
  });

  it('should return different UUIDs for different seeds', () => {
    expect(buildDeterministicUuid('seed-1')).not.toBe(buildDeterministicUuid('seed-2'));
  });
});
