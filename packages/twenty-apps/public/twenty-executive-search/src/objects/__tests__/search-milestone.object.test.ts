import { describe, expect, it } from 'vitest';

import {
  SEARCH_MILESTONE_MILESTONE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  SEARCH_MILESTONE_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_MILESTONE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

describe('search-milestone object', () => {
  it('validates without errors', async () => {
    const mod = await import('src/objects/search-milestone.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe(
      SEARCH_MILESTONE_OBJECT_UNIVERSAL_IDENTIFIER,
    );
    expect(result.config.nameSingular).toBe('searchMilestone');
  });

  it('has 6 fields including relations', async () => {
    const mod = await import('src/objects/search-milestone.object');
    const fields = mod.default.config.fields;
    expect(fields.length).toBe(6);
  });

  it('has milestoneType SELECT with 10 options', async () => {
    const mod = await import('src/objects/search-milestone.object');
    const fields = mod.default.config.fields;
    const milestoneTypeField = fields.find(
      (f: { universalIdentifier: string }) =>
        f.universalIdentifier ===
        SEARCH_MILESTONE_MILESTONE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(milestoneTypeField).toBeDefined();
    expect(milestoneTypeField!.options).toBeDefined();
    expect(milestoneTypeField!.options!.length).toBe(10);
  });

  it('has status SELECT with 4 options', async () => {
    const mod = await import('src/objects/search-milestone.object');
    const fields = mod.default.config.fields;
    const statusField = fields.find(
      (f: { universalIdentifier: string }) =>
        f.universalIdentifier ===
        SEARCH_MILESTONE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(statusField).toBeDefined();
    expect(statusField!.options).toBeDefined();
    expect(statusField!.options!.length).toBe(4);
  });
});
