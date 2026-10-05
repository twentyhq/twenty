import { convertValidationRuleFromFieldSymbols } from 'src/database/commands/upgrade-version-command/2-46/utils/convert-validation-rule-from-field-symbols.util';
import { convertValidationRuleToFieldSymbols } from 'src/database/commands/upgrade-version-command/2-46/utils/convert-validation-rule-to-field-symbols.util';

const LEGACY_RULE = {
  expression:
    'stage != "stage" or (isDefined(company) and company.employees > 10 and not isEmpty(amount.amountMicros))',
  bindings: {
    stage: 'stage-universal-identifier',
    company: 'company-universal-identifier',
    'company.employees': 'employees-universal-identifier',
    amount: 'amount-universal-identifier',
  },
};

const FIELD_NAME_BY_UNIVERSAL_IDENTIFIER = new Map([
  ['stage-universal-identifier', 'stage'],
  ['company-universal-identifier', 'company'],
  ['employees-universal-identifier', 'employees'],
  ['amount-universal-identifier', 'amount'],
]);

describe('convertValidationRuleFromFieldSymbols', () => {
  it('should restore the name-based rule the conversion started from', () => {
    const convertedRule = convertValidationRuleToFieldSymbols(LEGACY_RULE);

    if (convertedRule === null) {
      throw new Error('The legacy rule should be converted');
    }

    expect(
      convertValidationRuleFromFieldSymbols({
        expression: convertedRule.expression,
        bindings: convertedRule.bindings,
        fieldNameByUniversalIdentifier: FIELD_NAME_BY_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual(LEGACY_RULE);
  });

  it('should write the current field names and keep the symbol of a field that no longer exists', () => {
    expect(
      convertValidationRuleFromFieldSymbols({
        expression: '$f1.$f2 > 10 or isDefined($f3)',
        bindings: {
          $f1: 'company-universal-identifier',
          $f2: 'employees-universal-identifier',
          $f3: 'deleted-universal-identifier',
        },
        fieldNameByUniversalIdentifier: new Map([
          ['company-universal-identifier', 'account'],
          ['employees-universal-identifier', 'headcount'],
        ]),
      }),
    ).toEqual({
      expression: 'account.headcount > 10 or isDefined($f3)',
      bindings: {
        account: 'company-universal-identifier',
        'account.headcount': 'employees-universal-identifier',
        $f3: 'deleted-universal-identifier',
      },
    });
  });

  it('should leave a name-based rule alone', () => {
    expect(
      convertValidationRuleFromFieldSymbols({
        ...LEGACY_RULE,
        fieldNameByUniversalIdentifier: FIELD_NAME_BY_UNIVERSAL_IDENTIFIER,
      }),
    ).toBeNull();
  });
});
