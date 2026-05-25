import { describe, expect, it } from 'vitest';

import { defineIndex } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '4f1b9f9f-1111-2222-3333-444444444444',
  objectUniversalIdentifier: '4f1b9f9f-aaaa-bbbb-cccc-dddddddddddd',
  indexType: 'BTREE' as const,
  fields: [
    {
      universalIdentifier: '4f1b9f9f-1111-1111-1111-111111111111',
      fieldUniversalIdentifier: '4f1b9f9f-eeee-ffff-0000-111111111111',
    },
  ],
};

describe('defineIndex', () => {
  it('returns success for a valid config', () => {
    const result = defineIndex(baseValidConfig);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports a missing universalIdentifier', () => {
    const result = defineIndex({ ...baseValidConfig, universalIdentifier: '' });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Index must have a universalIdentifier');
  });

  it('rejects a whitespace-only universalIdentifier', () => {
    const result = defineIndex({
      ...baseValidConfig,
      universalIdentifier: '   ',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Index must have a universalIdentifier');
  });

  it('reports a missing objectUniversalIdentifier', () => {
    const result = defineIndex({
      ...baseValidConfig,
      objectUniversalIdentifier: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Index must reference an objectUniversalIdentifier',
    );
  });

  it('reports an empty fields list', () => {
    const result = defineIndex({ ...baseValidConfig, fields: [] });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Index must have at least one field');
  });

  it('rejects duplicate (fieldUniversalIdentifier, subFieldName) pairs', () => {
    const result = defineIndex({
      ...baseValidConfig,
      fields: [
        {
          universalIdentifier: '4f1b9f9f-1111-1111-1111-111111111111',
          fieldUniversalIdentifier: '4f1b9f9f-eeee-ffff-0000-111111111111',
        },
        {
          universalIdentifier: '4f1b9f9f-1111-1111-1111-222222222222',
          fieldUniversalIdentifier: '4f1b9f9f-eeee-ffff-0000-111111111111',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Index lists the same column twice');
  });

  it('reports a missing fieldUniversalIdentifier on an entry', () => {
    const result = defineIndex({
      ...baseValidConfig,
      fields: [
        {
          universalIdentifier: '4f1b9f9f-1111-1111-1111-111111111111',
          fieldUniversalIdentifier: '',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'IndexField must reference a fieldUniversalIdentifier',
    );
  });
});
