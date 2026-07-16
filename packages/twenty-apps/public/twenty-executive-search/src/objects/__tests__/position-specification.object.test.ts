import { describe, expect, it } from 'vitest';

import {
  POSITION_SPECIFICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  POSITION_SPECIFICATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

describe('position-specification object', () => {
  it('validates without errors', async () => {
    const mod = await import('src/objects/position-specification.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe(
      POSITION_SPECIFICATION_OBJECT_UNIVERSAL_IDENTIFIER,
    );
    expect(result.config.nameSingular).toBe('positionSpecification');
  });

  it('has 13 fields including relations', async () => {
    const mod = await import('src/objects/position-specification.object');
    const fields = mod.default.config.fields;
    expect(fields.length).toBe(13);
  });

  it('has status SELECT with 5 options', async () => {
    const mod = await import('src/objects/position-specification.object');
    const fields = mod.default.config.fields;
    const statusField = fields.find(
      (f: { universalIdentifier: string }) =>
        f.universalIdentifier ===
        POSITION_SPECIFICATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(statusField).toBeDefined();
    expect(statusField!.options).toBeDefined();
    expect(statusField!.options!.length).toBe(5);
  });
});
