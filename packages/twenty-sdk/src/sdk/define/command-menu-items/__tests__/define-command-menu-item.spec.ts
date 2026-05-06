import { describe, expect, it } from 'vitest';

import { defineCommandMenuItem } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  label: 'Open dashboard',
  frontComponentUniversalIdentifier: '22222222-2222-4222-8222-222222222222',
};

describe('defineCommandMenuItem', () => {
  it('returns success for a valid config', () => {
    const result = defineCommandMenuItem(baseValidConfig);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports a missing universalIdentifier', () => {
    const result = defineCommandMenuItem({
      ...baseValidConfig,
      universalIdentifier: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'CommandMenuItem must have a universalIdentifier',
    );
  });

  it('reports a missing label', () => {
    const result = defineCommandMenuItem({
      ...baseValidConfig,
      label: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('CommandMenuItem must have a label');
  });

  it('reports a missing frontComponentUniversalIdentifier', () => {
    const result = defineCommandMenuItem({
      ...baseValidConfig,
      frontComponentUniversalIdentifier: '',
    });

    expect(result.success).toBe(false);
    expect(
      result.errors.some((error) =>
        error.includes('frontComponentUniversalIdentifier'),
      ),
    ).toBe(true);
  });

  it('passes through optional fields', () => {
    const result = defineCommandMenuItem({
      ...baseValidConfig,
      icon: 'IconRocket',
      shortLabel: 'Open',
      isPinned: true,
      availabilityType: 'GLOBAL',
    });

    expect(result.success).toBe(true);
    expect(result.config.icon).toBe('IconRocket');
    expect(result.config.isPinned).toBe(true);
  });
});
