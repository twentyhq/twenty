import { describe, expect, it } from 'vitest';

import {
  SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

describe('search-assignment object', () => {
  it('validates without errors', async () => {
    const mod = await import('src/objects/search-assignment.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe(
      SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
    );
    expect(result.config.nameSingular).toBe('searchAssignment');
  });

  it('has 12 fields including relations', async () => {
    const mod = await import('src/objects/search-assignment.object');
    const fields = mod.default.config.fields;
    expect(fields.length).toBe(12);
  });

  it('has status SELECT with 11 options', async () => {
    const mod = await import('src/objects/search-assignment.object');
    const fields = mod.default.config.fields;
    const statusField = fields.find(
      (f: { universalIdentifier: string }) =>
        f.universalIdentifier ===
        SEARCH_ASSIGNMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(statusField).toBeDefined();
    expect(statusField!.options).toBeDefined();
    expect(statusField!.options!.length).toBe(11);
  });
});
