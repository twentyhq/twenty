import {
  FieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { compileValidationRuleExpression } from 'twenty-shared/utils';

import { convertValidationRuleToFieldSymbols } from 'src/database/commands/upgrade-version-command/2-46/utils/convert-validation-rule-to-field-symbols.util';

const OPPORTUNITY_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'stage-universal-identifier',
  },
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'amount-universal-identifier',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'company-universal-identifier',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'employees',
        type: FieldMetadataType.NUMBER,
        universalIdentifier: 'employees-universal-identifier',
      },
    ],
  },
];

describe('convertValidationRuleToFieldSymbols', () => {
  it('should replace root fields, relations and related fields with symbols, keeping subfields, functions, now and strings', () => {
    expect(
      convertValidationRuleToFieldSymbols({
        expression:
          'stage != "stage" or (isDefined(company) and company.employees > 10 and not isEmpty(amount.amountMicros) and closeDate < now)',
        bindings: {
          stage: 'stage-universal-identifier',
          company: 'company-universal-identifier',
          'company.employees': 'employees-universal-identifier',
          amount: 'amount-universal-identifier',
          closeDate: 'close-date-universal-identifier',
        },
      }),
    ).toEqual({
      expression:
        '$f1 != "stage" or (isDefined($f2) and $f2.$f3 > 10 and not isEmpty($f4.amountMicros) and $f5 < now)',
      bindings: {
        $f1: 'stage-universal-identifier',
        $f2: 'company-universal-identifier',
        $f3: 'employees-universal-identifier',
        $f4: 'amount-universal-identifier',
        $f5: 'close-date-universal-identifier',
      },
      hasUnconvertedFields: false,
    });
  });

  it('should give a field read through two relations the same symbol', () => {
    expect(
      convertValidationRuleToFieldSymbols({
        expression: 'company.name == parentCompany.name',
        bindings: {
          company: 'company-universal-identifier',
          'company.name': 'company-name-universal-identifier',
          parentCompany: 'parent-company-universal-identifier',
          'parentCompany.name': 'company-name-universal-identifier',
        },
      }),
    ).toEqual({
      expression: '$f1.$f2 == $f3.$f2',
      bindings: {
        $f1: 'company-universal-identifier',
        $f2: 'company-name-universal-identifier',
        $f3: 'parent-company-universal-identifier',
      },
      hasUnconvertedFields: false,
    });
  });

  it('should leave a rule that reads no field or is already converted alone', () => {
    expect(
      convertValidationRuleToFieldSymbols({
        expression: 'now > "2026-01-01"',
        bindings: {},
      }),
    ).toBeNull();
    expect(
      convertValidationRuleToFieldSymbols({
        expression: 'isDefined($f1)',
        bindings: { $f1: 'stage-universal-identifier' },
      }),
    ).toBeNull();
  });

  it('should convert a disabled rule whose field was deleted, from its stored bindings only', () => {
    expect(
      convertValidationRuleToFieldSymbols({
        expression: 'isNonEmptyString(reference)',
        bindings: { reference: 'deleted-field-universal-identifier' },
      }),
    ).toEqual({
      expression: 'isNonEmptyString($f1)',
      bindings: { $f1: 'deleted-field-universal-identifier' },
      hasUnconvertedFields: false,
    });
  });

  it('should produce what compiling the name-based expression gives today', () => {
    const expression =
      'stage != "WON" or (company.employees > 10 and not isEmpty(amount))';

    const convertedRule = convertValidationRuleToFieldSymbols({
      expression,
      bindings: {
        stage: 'stage-universal-identifier',
        company: 'company-universal-identifier',
        'company.employees': 'employees-universal-identifier',
        amount: 'amount-universal-identifier',
      },
    });

    expect(convertedRule?.hasUnconvertedFields).toBe(false);
    expect(
      compileValidationRuleExpression({ expression, fields: OPPORTUNITY_FIELDS }),
    ).toEqual({
      isValid: true,
      expression: convertedRule?.expression,
      bindings: convertedRule?.bindings,
    });
  });

  it('should flag a related field read through parentheses, which it cannot bind to a symbol', () => {
    expect(
      convertValidationRuleToFieldSymbols({
        expression: '(company).employees > 10',
        bindings: {
          company: 'company-universal-identifier',
          'company.employees': 'employees-universal-identifier',
        },
      }),
    ).toEqual({
      expression: '($f1).employees > 10',
      bindings: { $f1: 'company-universal-identifier' },
      hasUnconvertedFields: true,
    });
    expect(
      convertValidationRuleToFieldSymbols({
        expression: 'company.employees > 10 and (company).employees < 100',
        bindings: {
          company: 'company-universal-identifier',
          'company.employees': 'employees-universal-identifier',
        },
      })?.hasUnconvertedFields,
    ).toBe(true);
  });
});
