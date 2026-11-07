import { computeRecordUpdateFieldsToComplete } from '@/object-record/record-form/utils/computeRecordUpdateFieldsToComplete';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const STAGE_FIELD_ID = 'stage-field';
const LOST_REASON_FIELD_ID = 'lost-reason-field';

const FIELDS = [
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
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'stage',
  },
  {
    name: 'lostReason',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'lostReason',
  },
];

const FIELD_METADATA_ITEMS = [
  { id: STAGE_FIELD_ID, name: 'stage', type: FieldMetadataType.SELECT },
  {
    id: LOST_REASON_FIELD_ID,
    name: 'lostReason',
    type: FieldMetadataType.SELECT,
  },
].map((fieldMetadataItem) => ({
  ...fieldMetadataItem,
  isActive: true,
  isSystem: false,
  isUIEditable: true,
  settings: null,
  defaultValue: null,
}));

const LOST_REASON_RULE: ValidationRule = {
  id: 'lost-reason-rule',
  objectMetadataId: 'opportunity',
  name: 'Lost needs a reason',
  description: null,
  icon: null,
  errorFieldMetadataId: LOST_REASON_FIELD_ID,
  expression: "stage != 'LOST' or not isEmpty(lostReason)",
  message: 'Pick a lost reason before moving this deal to Lost',
  isActive: true,
};

const COMPANY_SIZE_RULE: ValidationRule = {
  ...LOST_REASON_RULE,
  id: 'company-size-rule',
  expression: 'company.employees >= 10',
  message: 'Pick a company with at least 10 employees',
};

const compute = ({
  currentRecord,
  updateInput,
  canUpdateField = () => true,
  validationRules = [LOST_REASON_RULE],
  fieldMetadataItems = FIELD_METADATA_ITEMS,
}: {
  currentRecord: Record<string, unknown>;
  updateInput: Record<string, unknown>;
  canUpdateField?: (fieldMetadataId: string) => boolean;
  validationRules?: ValidationRule[];
  fieldMetadataItems?: typeof FIELD_METADATA_ITEMS;
}) =>
  computeRecordUpdateFieldsToComplete({
    validationRules,
    currentRecord,
    updateInput,
    fields: FIELDS,
    fieldMetadataItems,
    canUpdateField,
    now: '2026-11-04T10:00:00.000Z',
  });

describe('computeRecordUpdateFieldsToComplete', () => {
  it('asks for the field a rule needs when the update breaks it', () => {
    const result = compute({
      currentRecord: { stage: 'PROPOSAL', lostReason: null },
      updateInput: { stage: 'LOST' },
    });

    expect(result.fieldMetadataIds).toEqual([LOST_REASON_FIELD_ID]);
    expect(result.violations).toEqual([
      {
        ruleId: 'lost-reason-rule',
        message: 'Pick a lost reason before moving this deal to Lost',
        fieldMetadataId: LOST_REASON_FIELD_ID,
      },
    ]);
    expect(result.draftRecord).toEqual({ stage: 'LOST', lostReason: null });
  });

  it('asks for nothing when the record already has the field', () => {
    expect(
      compute({
        currentRecord: { stage: 'PROPOSAL', lostReason: 'PRICING' },
        updateInput: { stage: 'LOST' },
      }).fieldMetadataIds,
    ).toEqual([]);
  });

  it('does not ask again for the field being edited', () => {
    expect(
      compute({
        currentRecord: { stage: 'LOST', lostReason: 'PRICING' },
        updateInput: { lostReason: null },
      }).fieldMetadataIds,
    ).toEqual([]);
  });

  it('does not ask for a field the person cannot edit', () => {
    expect(
      compute({
        currentRecord: { stage: 'PROPOSAL', lostReason: null },
        updateInput: { stage: 'LOST' },
        canUpdateField: (fieldMetadataId) =>
          fieldMetadataId !== LOST_REASON_FIELD_ID,
      }).fieldMetadataIds,
    ).toEqual([]);
  });

  it('leaves rules reading a relation to the server when the update changes it', () => {
    const result = compute({
      currentRecord: {
        stage: 'PROPOSAL',
        lostReason: null,
        companyId: 'small-company',
        company: { id: 'small-company', employees: 3 },
      },
      updateInput: { companyId: 'unknown-company' },
      validationRules: [COMPANY_SIZE_RULE],
    });

    expect(result.draftRecord).not.toHaveProperty('company');
    expect(result.fieldMetadataIds).toEqual([]);
  });

  it('does not ask for a field that cannot be edited in a form', () => {
    expect(
      compute({
        currentRecord: { stage: 'PROPOSAL', lostReason: null },
        updateInput: { stage: 'LOST' },
        fieldMetadataItems: FIELD_METADATA_ITEMS.map((fieldMetadataItem) =>
          fieldMetadataItem.id === LOST_REASON_FIELD_ID
            ? { ...fieldMetadataItem, isUIEditable: false }
            : fieldMetadataItem,
        ),
      }).fieldMetadataIds,
    ).toEqual([]);
  });

  it('asks for nothing when the broken rule names no field', () => {
    expect(
      compute({
        currentRecord: { stage: 'PROPOSAL', lostReason: null },
        updateInput: { stage: 'LOST' },
        validationRules: [{ ...LOST_REASON_RULE, errorFieldMetadataId: null }],
      }).fieldMetadataIds,
    ).toEqual([]);
  });

  it('ignores an inactive rule', () => {
    expect(
      compute({
        currentRecord: { stage: 'PROPOSAL', lostReason: null },
        updateInput: { stage: 'LOST' },
        validationRules: [{ ...LOST_REASON_RULE, isActive: false }],
      }).fieldMetadataIds,
    ).toEqual([]);
  });
});
