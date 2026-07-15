import { describe, expect, it } from 'vitest';

import {
  SEARCH_CRITERION_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
  SEARCH_CRITERION_CRITERION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  SEARCH_CRITERION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

describe('search-criterion object', () => {
  it('validates without errors', async () => {
    const mod = await import('src/objects/search-criterion.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe(
      SEARCH_CRITERION_OBJECT_UNIVERSAL_IDENTIFIER,
    );
    expect(result.config.nameSingular).toBe('searchCriterion');
  });

  it('has 6 fields including relations', async () => {
    const mod = await import('src/objects/search-criterion.object');
    const fields = mod.default.config.fields;
    expect(fields.length).toBe(6);
  });

  it('has category SELECT with 3 options', async () => {
    const mod = await import('src/objects/search-criterion.object');
    const fields = mod.default.config.fields;
    const categoryField = fields.find(
      (f: { universalIdentifier: string }) =>
        f.universalIdentifier ===
        SEARCH_CRITERION_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(categoryField).toBeDefined();
    expect(categoryField!.options).toBeDefined();
    expect(categoryField!.options!.length).toBe(3);
  });

  it('has criterionType SELECT with 8 options', async () => {
    const mod = await import('src/objects/search-criterion.object');
    const fields = mod.default.config.fields;
    const criterionTypeField = fields.find(
      (f: { universalIdentifier: string }) =>
        f.universalIdentifier ===
        SEARCH_CRITERION_CRITERION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(criterionTypeField).toBeDefined();
    expect(criterionTypeField!.options).toBeDefined();
    expect(criterionTypeField!.options!.length).toBe(8);
  });
});
