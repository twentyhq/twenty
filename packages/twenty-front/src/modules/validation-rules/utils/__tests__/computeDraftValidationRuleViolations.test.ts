import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
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
    name: 'tagline',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'tagline',
  },
  {
    name: 'createdAt',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: 'createdAt',
  },
  {
    name: 'closeDate',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: 'closeDate',
  },
  {
    name: 'position',
    type: FieldMetadataType.POSITION,
    universalIdentifier: 'position',
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
  name: 'Customer needs an amount',
  description: null,
  icon: null,
  errorFieldMetadataId: 'amount-field',
  expression: '$f1 != "CUSTOMER" or not isEmpty($f2)',
  bindings: { $f1: 'stage', $f2: 'amount' },
  message: 'A customer deal needs an amount',
  isActive: true,
};

const COMPANY_RULE = {
  id: 'company-rule',
  objectMetadataId: 'opportunity',
  name: 'Company is big enough',
  description: null,
  icon: null,
  errorFieldMetadataId: null,
  expression: '$f1.$f2 >= 10',
  bindings: { $f1: 'company', $f2: 'company-employees' },
  message: 'Company is too small',
  isActive: true,
};

const compute = (
  draftRecord: Record<string, unknown>,
  validationRules: ValidationRule[] = [AMOUNT_RULE],
  fieldMetadataItems: Pick<
    FieldMetadataItem,
    'name' | 'isSystem' | 'defaultValue'
  >[] = [],
) =>
  computeDraftValidationRuleViolations({
    validationRules,
    draftRecord,
    fields: FIELDS,
    fieldMetadataItems,
    now: '2026-09-23T10:00:00.000Z',
  });

const TAGLINE_RULE = {
  ...AMOUNT_RULE,
  id: 'tagline-rule',
  expression: 'isNonEmptyString($f1)',
  bindings: { $f1: 'tagline' },
  message: 'A company needs a tagline',
};

describe('computeDraftValidationRuleViolations', () => {
  it('should report the rule when the draft violates it', () => {
    expect(
      compute({
        stage: 'CUSTOMER',
        amount: { amountMicros: null, currencyCode: 'USD' },
      }),
    ).toEqual([
      {
        ruleId: 'amount-rule',
        message: 'A customer deal needs an amount',
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

  it('should leave a rule to the server when it reads an absent field the server fills', () => {
    const draftWithoutCloseDate = {
      amount: { amountMicros: null, currencyCode: 'USD' },
    };
    const closeDateRule = {
      ...AMOUNT_RULE,
      expression: 'isDefined($f1) or not isEmpty($f2)',
      bindings: { $f1: 'closeDate', $f2: 'amount' },
    };
    const closeDateFieldMetadataItem = {
      name: 'closeDate',
      isSystem: false,
      defaultValue: 'now',
    };

    expect(
      compute(draftWithoutCloseDate, [closeDateRule]).map(
        (violation) => violation.ruleId,
      ),
    ).toEqual(['amount-rule']);
    expect(
      compute(
        draftWithoutCloseDate,
        [closeDateRule],
        [closeDateFieldMetadataItem],
      ),
    ).toEqual([]);
    expect(
      compute(
        { ...draftWithoutCloseDate, closeDate: null },
        [closeDateRule],
        [closeDateFieldMetadataItem],
      ).map((violation) => violation.ruleId),
    ).toEqual(['amount-rule']);
  });

  it('should evaluate an absent field with its static default value', () => {
    expect(
      compute(
        {},
        [TAGLINE_RULE],
        [{ name: 'tagline', isSystem: false, defaultValue: "''" }],
      ).map((violation) => violation.ruleId),
    ).toEqual(['tagline-rule']);
    expect(
      compute(
        {},
        [TAGLINE_RULE],
        [{ name: 'tagline', isSystem: false, defaultValue: "'Our motto'" }],
      ),
    ).toEqual([]);
    expect(
      compute(
        { amount: { amountMicros: null, currencyCode: 'USD' } },
        [AMOUNT_RULE],
        [{ name: 'stage', isSystem: false, defaultValue: "'CUSTOMER'" }],
      ).map((violation) => violation.ruleId),
    ).toEqual(['amount-rule']);
  });

  it('should prefer the draft value over the static default value', () => {
    expect(
      compute(
        { tagline: 'Our motto' },
        [TAGLINE_RULE],
        [{ name: 'tagline', isSystem: false, defaultValue: "''" }],
      ),
    ).toEqual([]);
  });

  it('should keep the static default value when the draft value is undefined', () => {
    expect(
      compute(
        { tagline: undefined },
        [TAGLINE_RULE],
        [{ name: 'tagline', isSystem: false, defaultValue: "'Our motto'" }],
      ),
    ).toEqual([]);
  });

  it('should leave a rule on an absent system field to the server', () => {
    expect(
      compute(
        {},
        [
          {
            ...AMOUNT_RULE,
            expression: 'isDefined($f1)',
            bindings: { $f1: 'createdAt' },
          },
        ],
        [{ name: 'createdAt', isSystem: true, defaultValue: 'now' }],
      ),
    ).toEqual([]);
    expect(
      compute(
        {},
        [
          {
            ...AMOUNT_RULE,
            expression: '$f1 > 1',
            bindings: { $f1: 'position' },
          },
        ],
        [{ name: 'position', isSystem: true, defaultValue: 0 }],
      ),
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
        { ...COMPANY_RULE, expression: 'isDefined($f1)' },
      ]),
    ).toEqual([]);
    expect(
      compute({ companyId: null }, [
        { ...COMPANY_RULE, expression: 'isDefined($f1)' },
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
  it('should keep checking a rule after the fields it reads are renamed', () => {
    const renamedFields = FIELDS.map((field) =>
      field.universalIdentifier === 'company'
        ? {
            ...field,
            name: 'account',
            relationTargetFields: field.relationTargetFields?.map(
              (targetField) => ({ ...targetField, name: 'headcount' }),
            ),
          }
        : field,
    );

    expect(
      computeDraftValidationRuleViolations({
        validationRules: [COMPANY_RULE],
        draftRecord: { account: { headcount: 3 } },
        fields: renamedFields,
        fieldMetadataItems: [],
        now: '2026-09-23T10:00:00.000Z',
      }).map((violation) => violation.ruleId),
    ).toEqual(['company-rule']);
  });
});
