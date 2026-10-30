import { describe, expect, it } from 'vitest';
import { FieldMetadataType } from 'twenty-shared/types';
import { compileValidationRuleExpression } from 'twenty-shared/utils';

import { defineValidationRule, ruleExpression } from '@/sdk/define';

const {
  and,
  arrayLength,
  eq,
  field,
  gt,
  isIn,
  isNonEmptyString,
  not,
  now,
  or,
} = ruleExpression;

describe('ruleExpression', () => {
  it('writes the syntax the server compiles', () => {
    const { source } = and(
      gt(field('amount'), 0),
      or(isNonEmptyString(field('name')), not(isIn(field('stage'), ['NEW']))),
    );

    expect(source).toBe(
      '(amount > 0) and (isNonEmptyString(name) or (not (stage in ["NEW"])))',
    );
    expect(
      compileValidationRuleExpression({
        expression: source,
        fields: [
          {
            name: 'amount',
            type: FieldMetadataType.NUMBER,
            universalIdentifier: 'amount',
          },
          {
            name: 'name',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'name',
          },
          {
            name: 'stage',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'stage',
          },
        ],
      }),
    ).toMatchObject({ isValid: true });
  });

  it('escapes text values', () => {
    expect(eq(field('name'), 'say "hi"').source).toBe('name == "say \\"hi\\""');
  });

  it('exposes every function and the current time', () => {
    expect(gt(arrayLength(field('tags')), 1).source).toBe(
      'arrayLength(tags) > 1',
    );
    expect(gt(field('closeDate'), now).source).toBe('closeDate > now');
  });

  it('leaves a single operand as it is', () => {
    expect(and(isNonEmptyString(field('name'))).source).toBe(
      'isNonEmptyString(name)',
    );
  });

  it('is turned into a string by defineValidationRule', () => {
    expect(
      defineValidationRule({
        universalIdentifier: '11111111-1111-4111-8111-111111111111',
        objectUniversalIdentifier: '22222222-2222-4222-8222-222222222222',
        name: 'Has a name',
        expression: isNonEmptyString(field('name')),
        message: 'Add a name',
      }).config.expression,
    ).toBe('isNonEmptyString(name)');
  });
});
