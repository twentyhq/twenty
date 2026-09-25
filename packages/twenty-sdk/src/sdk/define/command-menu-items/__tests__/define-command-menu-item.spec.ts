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
    expect(result.warnings).toContain(
      'CommandMenuItem icon will be ignored in favor of application icon, you should remove it',
    );
  });

  describe('RECORD_FIELD availability', () => {
    const recordFieldConfig = {
      ...baseValidConfig,
      availabilityType: 'RECORD_FIELD' as const,
      availabilityObjectUniversalIdentifier:
        '33333333-3333-4333-8333-333333333333',
      availabilityFieldUniversalIdentifier:
        '44444444-4444-4444-8444-444444444444',
    };

    it('returns success with an object, a field, a variant and an icon', () => {
      const result = defineCommandMenuItem({
        ...recordFieldConfig,
        icon: 'IconVideo',
        variant: 'PRIMARY',
        conditionalVariantExpression:
          'none(selectedRecords, "videoLink.primaryLinkUrl") ? "PRIMARY" : "SECONDARY"',
      });

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('reports a missing availabilityFieldUniversalIdentifier', () => {
      const result = defineCommandMenuItem({
        ...recordFieldConfig,
        availabilityFieldUniversalIdentifier: undefined,
      });

      expect(result.success).toBe(false);
      expect(
        result.errors.some((error) =>
          error.includes('availabilityFieldUniversalIdentifier'),
        ),
      ).toBe(true);
    });

    it('reports a missing availabilityObjectUniversalIdentifier', () => {
      const result = defineCommandMenuItem({
        ...recordFieldConfig,
        availabilityObjectUniversalIdentifier: undefined,
      });

      expect(result.success).toBe(false);
      expect(
        result.errors.some((error) =>
          error.includes('availabilityObjectUniversalIdentifier'),
        ),
      ).toBe(true);
    });

    it('reports a field on a command that is not RECORD_FIELD', () => {
      const result = defineCommandMenuItem({
        ...recordFieldConfig,
        availabilityType: 'RECORD_SELECTION',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'CommandMenuItem availabilityFieldUniversalIdentifier requires availabilityType RECORD_FIELD',
      );
    });
  });
});
