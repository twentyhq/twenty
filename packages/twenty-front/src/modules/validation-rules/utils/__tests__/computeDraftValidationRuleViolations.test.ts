import { computeDraftValidationRuleViolations } from '@/validation-rules/utils/computeDraftValidationRuleViolations';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const FIELDS = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'stage',
  },
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'amount',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'employees',
        type: FieldMetadataType.NUMBER,
        universalIdentifier: 'company-employees',
      },
    ],
  },
];

const AMOUNT_RULE = {
  id: 'amount-rule',
  objectMetadataId: 'opportunity',
  errorFieldMetadataId: 'amount-field',
  expression: 'stage == "CUSTOMER" and isEmpty(amount)',
  message: 'A customer deal needs an amount',
  isActive: true,
};

const COMPANY_RULE = {
  id: 'company-rule',
  objectMetadataId: 'opportunity',
  errorFieldMetadataId: null,
  expression: 'company.employees < 10',
  message: 'Company is too small',
  isActive: true,
};

const compute = (
  draftRecord: Record<string, unknown>,
  validationRules = [AMOUNT_RULE],
) =>
  computeDraftValidationRuleViolations({
    validationRules,
    draftRecord,
    fields: FIELDS,
    now: '2026-09-23T10:00:00.000Z',
  });

describe('computeDraftValidationRuleViolations', () => {
  it('should report the rule and its field when the draft violates it', () => {
    expect(
      compute({
        stage: 'CUSTOMER',
        amount: { amountMicros: null, currencyCode: 'USD' },
      }),
    ).toEqual([
      {
        ruleId: 'amount-rule',
        message: 'A customer deal needs an amount',
        fieldMetadataId: 'amount-field',
      },
    ]);
  });

  it('should pass a draft that satisfies the rule', () => {
    expect(
      compute({
        stage: 'CUSTOMER',
        amount: { amountMicros: 1000000, currencyCode: 'USD' },
      }),
    ).toEqual([]);
  });

  it('should skip inactive rules', () => {
    expect(
      compute({ stage: 'CUSTOMER' }, [{ ...AMOUNT_RULE, isActive: false }]),
    ).toEqual([]);
  });

  it('should skip a rule whose related record is not loaded in the draft', () => {
    expect(compute({ companyId: 'company-id' }, [COMPANY_RULE])).toEqual([]);
  });

  it('should treat a set join column as a defined relation', () => {
    expect(
      compute({ companyId: 'company-id' }, [
        { ...COMPANY_RULE, expression: 'not isDefined(company)' },
      ]),
    ).toEqual([]);
    expect(
      compute({ companyId: null }, [
        { ...COMPANY_RULE, expression: 'not isDefined(company)' },
      ]).map((violation) => violation.ruleId),
    ).toEqual(['company-rule']);
  });

  it('should evaluate a rule whose related record is loaded', () => {
    expect(
      compute({ company: { employees: 3 } }, [COMPANY_RULE]).map(
        (violation) => violation.ruleId,
      ),
    ).toEqual(['company-rule']);
  });
});
