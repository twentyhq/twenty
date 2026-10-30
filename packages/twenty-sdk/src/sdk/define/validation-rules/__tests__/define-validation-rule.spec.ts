import { describe, expect, it } from 'vitest';

import { defineValidationRule } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  objectUniversalIdentifier: '22222222-2222-4222-8222-222222222222',
  name: 'Close date after start date',
  expression: 'closeDate >= startDate',
  message: 'The close date must be after the start date',
  errorFieldUniversalIdentifier: '33333333-3333-4333-8333-333333333333',
};

describe('defineValidationRule', () => {
  it('accepts a complete validation rule', () => {
    expect(defineValidationRule(baseValidConfig)).toEqual({
      success: true,
      config: baseValidConfig,
      errors: [],
      warnings: [],
    });
  });

  it.each([
    ['universalIdentifier', 'ValidationRule must have a universalIdentifier'],
    [
      'objectUniversalIdentifier',
      'ValidationRule must have an objectUniversalIdentifier',
    ],
    ['name', 'ValidationRule must have a name'],
    ['expression', 'ValidationRule must have an expression'],
    ['message', 'ValidationRule must have a message'],
  ] as const)('reports a missing %s', (property, error) => {
    const result = defineValidationRule({
      ...baseValidConfig,
      [property]: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(error);
  });

  it('rejects a blank expression', () => {
    expect(
      defineValidationRule({ ...baseValidConfig, expression: '   ' }).errors,
    ).toEqual(['ValidationRule must have an expression']);
  });
});
