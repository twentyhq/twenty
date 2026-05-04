import { describe, expect, it } from 'vitest';

import { definePageLayoutWidget } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '33333333-3333-4333-8333-333333333333',
  pageLayoutTabUniversalIdentifier: '44444444-4444-4444-8444-444444444444',
  title: 'Recent activity',
  type: 'FRONT_COMPONENT',
  configuration: {
    configurationType: 'FRONT_COMPONENT' as const,
    frontComponentUniversalIdentifier: '55555555-5555-4555-8555-555555555555',
  },
};

describe('definePageLayoutWidget', () => {
  it('returns success for a valid config', () => {
    const result = definePageLayoutWidget(baseValidConfig);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports a missing universalIdentifier', () => {
    const result = definePageLayoutWidget({
      ...baseValidConfig,
      universalIdentifier: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'PageLayoutWidget must have a universalIdentifier',
    );
  });

  it('reports a missing title', () => {
    const result = definePageLayoutWidget({
      ...baseValidConfig,
      title: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('PageLayoutWidget must have a title');
  });

  it('reports a missing type', () => {
    const result = definePageLayoutWidget({
      ...baseValidConfig,
      type: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('PageLayoutWidget must have a type');
  });

  it('reports a missing pageLayoutTabUniversalIdentifier', () => {
    const result = definePageLayoutWidget({
      ...baseValidConfig,
      pageLayoutTabUniversalIdentifier: '',
    });

    expect(result.success).toBe(false);
    expect(
      result.errors.some((error) =>
        error.includes('pageLayoutTabUniversalIdentifier'),
      ),
    ).toBe(true);
  });
});
