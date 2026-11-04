import { computeRecordUpdateFieldsToComplete } from '@/object-record/record-form/utils/computeRecordUpdateFieldsToComplete';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { FieldMetadataType } from 'twenty-shared/types';

const STAGE_FIELD_ID = 'stage-field';
const LOST_REASON_FIELD_ID = 'lost-reason-field';

const FIELDS = [
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

const compute = ({
  currentRecord,
  updateInput,
  canUpdateField = () => true,
}: {
  currentRecord: Record<string, unknown>;
  updateInput: Record<string, unknown>;
  canUpdateField?: (fieldMetadataId: string) => boolean;
}) =>
  computeRecordUpdateFieldsToComplete({
    validationRules: [LOST_REASON_RULE],
    currentRecord,
    updateInput,
    fields: FIELDS,
    fieldMetadataItems: FIELD_METADATA_ITEMS,
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
});
