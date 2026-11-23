import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { isFieldMetadataItemEligibleForRecordForm } from '@/object-record/record-form/utils/isFieldMetadataItemEligibleForRecordForm';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';
import { computeDraftValidationRuleViolations } from '@/validation-rules/utils/computeDraftValidationRuleViolations';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

export const computeRecordUpdateFieldsToComplete = ({
  validationRules,
  currentRecord,
  previousRecord = currentRecord,
  updateInput,
  fields,
  fieldMetadataItems,
  canUpdateField,
  now,
}: {
  validationRules: ValidationRule[];
  currentRecord: Partial<ObjectRecord>;
  previousRecord?: Partial<ObjectRecord>;
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
  const relationFieldNamesWithChangedJoinColumn = fields
    .filter(
      (field) =>
        isDefined(field.relationTargetFields) &&
        computeRelationGqlFieldJoinColumnName({ name: field.name }) in
          updateInput,
    )
    .map((field) => field.name);

  const draftRecord = Object.fromEntries(
    Object.entries({ ...currentRecord, ...updateInput }).filter(
      ([fieldName]) =>
        !relationFieldNamesWithChangedJoinColumn.includes(fieldName),
    ),
  );

  const violations = computeDraftValidationRuleViolations({
    validationRules,
    draftRecord,
    previousRecord,
    fields,
    fieldMetadataItems,
    now,
  });

  const violatedFieldMetadataIds = new Set(
    violations.map((violation) => violation.fieldMetadataId).filter(isDefined),
  );

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
