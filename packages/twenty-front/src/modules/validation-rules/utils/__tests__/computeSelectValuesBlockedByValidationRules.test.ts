import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { computeSelectValuesBlockedByValidationRules } from '@/validation-rules/utils/computeSelectValuesBlockedByValidationRules';
import { FieldMetadataType } from 'twenty-shared/types';

const FIELDS = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'stage',
  },
  {
    name: 'pipeline',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'pipeline',
  },
  {
    name: 'lostReason',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'lostReason',
  },
];

const FIELD_METADATA_ITEMS = FIELDS.map((field) => ({
  name: field.name,
  isSystem: false,
  defaultValue: null,
}));

const STAGE_FIELD = { id: 'stage-field', name: 'stage' };

const STAGE_OPTION_VALUES = ['MET', 'FOLLOW_UP', 'SOLUTIONING', 'WON', 'LOST'];

const buildRule = (overrides: Partial<ValidationRule>): ValidationRule => ({
  id: 'rule',
  objectMetadataId: 'opportunity',
  name: 'Rule',
  description: null,
  icon: null,
  errorFieldMetadataId: STAGE_FIELD.id,
  expression: 'true',
  message: 'Invalid',
  isActive: true,
  ...overrides,
});

const SMB_STAGES_RULE = buildRule({
  id: 'smb-stages',
  expression:
    'pipeline != "SMB" or stage in ["MET", "FOLLOW_UP", "WON", "LOST"]',
});

const compute = ({
  validationRules,
  record,
}: {
  validationRules: ValidationRule[];
  record: Record<string, unknown>;
}) =>
  computeSelectValuesBlockedByValidationRules({
    validationRules,
    record,
    fieldMetadataItem: STAGE_FIELD,
    optionValues: STAGE_OPTION_VALUES,
    fields: FIELDS,
    fieldMetadataItems: FIELD_METADATA_ITEMS,
    now: '2026-11-04T12:00:00.000Z',
  });

describe('computeSelectValuesBlockedByValidationRules', () => {
  it('blocks the values a rule on this field rejects for the record', () => {
    expect(
      compute({
        validationRules: [SMB_STAGES_RULE],
        record: { id: '1', pipeline: 'SMB', stage: 'MET' },
      }),
    ).toEqual({
      blockedOptionValues: ['SOLUTIONING'],
      isEmptyValueBlocked: true,
    });
  });

  it('blocks nothing when the record is in another pipeline', () => {
    expect(
      compute({
        validationRules: [SMB_STAGES_RULE],
        record: { id: '1', pipeline: 'ENTERPRISE', stage: 'MET' },
      }),
    ).toEqual({ blockedOptionValues: [], isEmptyValueBlocked: false });
  });

  it('leaves a rule to the server when the record does not hold a value it reads', () => {
    expect(
      compute({
        validationRules: [SMB_STAGES_RULE],
        record: { id: '1', stage: 'MET' },
      }),
    ).toEqual({ blockedOptionValues: [], isEmptyValueBlocked: false });
  });

  it('keeps a value whose rule has another error field, which the person completes after picking', () => {
    const lostReasonRule = buildRule({
      id: 'lost-reason',
      errorFieldMetadataId: 'lost-reason-field',
      expression: 'stage != "LOST" or not isEmpty(lostReason)',
    });

    expect(
      compute({
        validationRules: [lostReasonRule],
        record: { id: '1', pipeline: 'SMB', stage: 'MET', lostReason: null },
      }),
    ).toEqual({ blockedOptionValues: [], isEmptyValueBlocked: false });
  });

  it('offers only the stages a transition rule allows after the stored one', () => {
    const nextStageRule = buildRule({
      id: 'next-stage',
      expression:
        'stage == previous.stage or (previous.stage == "MET" and stage in ["FOLLOW_UP", "LOST"]) or (previous.stage == "FOLLOW_UP" and stage in ["WON", "LOST"])',
    });

    expect(
      compute({
        validationRules: [nextStageRule],
        record: { id: '1', pipeline: 'SMB', stage: 'MET' },
      }),
    ).toEqual({
      blockedOptionValues: ['SOLUTIONING', 'WON'],
      isEmptyValueBlocked: true,
    });
  });

  it('leaves a transition rule to the server when the stored stage is not loaded', () => {
    const nextStageRule = buildRule({
      id: 'next-stage',
      expression: 'stage == previous.stage or previous.stage != "WON"',
    });

    expect(
      compute({ validationRules: [nextStageRule], record: { id: '1' } }),
    ).toEqual({ blockedOptionValues: [], isEmptyValueBlocked: false });
  });

  it('ignores inactive rules', () => {
    expect(
      compute({
        validationRules: [{ ...SMB_STAGES_RULE, isActive: false }],
        record: { id: '1', pipeline: 'SMB', stage: 'MET' },
      }),
    ).toEqual({ blockedOptionValues: [], isEmptyValueBlocked: false });
  });
});
