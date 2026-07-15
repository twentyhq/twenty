import { describe, expect, it } from 'vitest';

describe('searchEngagementTerms object', () => {
  it('validates without errors', async () => {
    const mod = await import('src/objects/search-engagement-terms.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.nameSingular).toBe('searchEngagementTerms');
    expect(result.config.fields.length).toBe(16);

    const statusField = result.config.fields.find(
      (f: any) => f.name === 'status',
    );
    expect(statusField).toBeDefined();
    expect(statusField!.options).toHaveLength(5);

    const engagementTypeField = result.config.fields.find(
      (f: any) => f.name === 'engagementType',
    );
    expect(engagementTypeField).toBeDefined();
    expect(engagementTypeField!.options).toHaveLength(3);

    const feeStructureField = result.config.fields.find(
      (f: any) => f.name === 'feeStructure',
    );
    expect(feeStructureField).toBeDefined();
    expect(feeStructureField!.options).toHaveLength(4);
  });
});
