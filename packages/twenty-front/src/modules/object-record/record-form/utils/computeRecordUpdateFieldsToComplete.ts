import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { isFieldMetadataItemEligibleForRecordForm } from '@/object-record/record-form/utils/isFieldMetadataItemEligibleForRecordForm';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';
import { computeDraftValidationRuleViolations } from '@/validation-rules/utils/computeDraftValidationRuleViolations';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const computeRecordUpdateFieldsToComplete = ({
  validationRules,
  currentRecord,
  updateInput,
  fields,
  fieldMetadataItems,
  canUpdateField,
  now,
}: {
  validationRules: ValidationRule[];
  currentRecord: Partial<ObjectRecord>;
  updateInput: Partial<ObjectRecord>;
  fields: ValidationRuleFieldDescriptor[];
  fieldMetadataItems: Pick<
    FieldMetadataItem,
    | 'id'
    | 'name'
    | 'type'
    | 'relation'
    | 'isActive'
    | 'isSystem'
    | 'isUIEditable'
    | 'settings'
    | 'defaultValue'
  >[];
  canUpdateField: (fieldMetadataId: string) => boolean;
  now: string;
}): {
  draftRecord: Partial<ObjectRecord>;
  fieldMetadataIds: string[];
  violations: ValidationRuleViolation[];
} => {
  const draftRecord = { ...currentRecord, ...updateInput };

  const violations = computeDraftValidationRuleViolations({
    validationRules,
    draftRecord,
    fields,
    fieldMetadataItems,
    now,
  });

  const violatedFieldMetadataIds = new Set(
    violations.map((violation) => violation.fieldMetadataId).filter(isDefined),
  );

  // A field the person is editing right now is already in front of them, so it is not asked for again
  const fieldMetadataIds = fieldMetadataItems
    .filter(
      (fieldMetadataItem) =>
        violatedFieldMetadataIds.has(fieldMetadataItem.id) &&
        isFieldMetadataItemEligibleForRecordForm(fieldMetadataItem) &&
        !(getFieldMetadataItemGqlFieldName(fieldMetadataItem) in updateInput) &&
        canUpdateField(fieldMetadataItem.id),
    )
    .map((fieldMetadataItem) => fieldMetadataItem.id);

  return {
    draftRecord,
    fieldMetadataIds,
    violations: violations.filter(
      (violation) =>
        isDefined(violation.fieldMetadataId) &&
        fieldMetadataIds.includes(violation.fieldMetadataId),
    ),
  };
};
