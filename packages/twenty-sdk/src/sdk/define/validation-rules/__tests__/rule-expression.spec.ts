import { describe, expect, it } from 'vitest';
import { VALIDATION_RULE_FUNCTIONS } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  parseValidationRuleExpression,
} from 'twenty-shared/utils';

import { defineValidationRule, ruleExpression } from '@/sdk/define';

const {
  add,
  and,
  arrayLength,
  divide,
  eq,
  field,
  gt,
  gte,
  isIn,
  isNonEmptyString,
  lt,
  lte,
  multiply,
  not,
  notEq,
  now,
  or,
  subtract,
} = ruleExpression;

const COMPILATION_FIELDS = [
  {
    name: 'name',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'name',
  },
  {
    name: 'amount',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'amount',
  },
  {
    name: 'closeDate',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: 'closeDate',
  },
  {
    name: 'stage',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'stage',
  },
];

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
        fields: COMPILATION_FIELDS,
      }),
    ).toMatchObject({ isValid: true });
  });

  it.each([
    ['eq', eq(field('stage'), 'NEW')],
    ['notEq', notEq(field('stage'), 'NEW')],
    ['gt', gt(field('amount'), 1)],
    ['gte', gte(field('amount'), 1)],
    ['lt', lt(field('amount'), 1)],
    ['lte', lte(field('amount'), 1)],
    ['add', gt(add(field('amount'), 1), 0)],
    ['subtract', gt(subtract(field('amount'), 1), 0)],
    ['multiply', gt(multiply(field('amount'), 2), 0)],
    ['divide', gt(divide(field('amount'), 2), 0)],
    ['isIn', isIn(field('stage'), ['NEW', 'WON'])],
    ['and', and(gt(field('amount'), 1), lt(field('amount'), 9))],
    ['or', or(gt(field('amount'), 1), lt(field('amount'), 9))],
    ['not', not(gt(field('amount'), 1))],
    ['now', gt(field('closeDate'), now)],
  ])('writes a %s the compiler accepts', (_, { source }) => {
    expect(
      compileValidationRuleExpression({
        expression: source,
        fields: COMPILATION_FIELDS,
      }),
    ).toMatchObject({ isValid: true });
  });

  it.each(Object.keys(VALIDATION_RULE_FUNCTIONS))(
    'writes %s in a form the parser accepts',
    (name) => {
      const declaredFunctionBuilders: Pick<
        typeof ruleExpression,
        keyof typeof VALIDATION_RULE_FUNCTIONS
      > = ruleExpression;
      const functionBuilders: Record<
        string,
        (...operands: (typeof now)[]) => typeof now
      > = declaredFunctionBuilders;

      expect(() =>
        parseValidationRuleExpression(
          functionBuilders[name](field('stage'), field('amount')).source,
        ),
      ).not.toThrow();
    },
  );

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

  it.each([NaN, Infinity])('rejects %s', (value) => {
    expect(() =>
      ruleExpression.gt(ruleExpression.field('score'), value),
    ).toThrow(`A rule expression can't compare with ${value}`);
  });
});
