import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isRecordPathLoaded } from '@/object-record/record-form/utils/isRecordPathLoaded';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { computeDraftValidationRuleViolations } from '@/validation-rules/utils/computeDraftValidationRuleViolations';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  getValidationRulePreviousValueFieldPath,
} from 'twenty-shared/utils';

// Only rules whose error field is this select can rule a value out: a rule that
// blames another field (a missing Lost reason) is completed after the pick, not
// prevented by it
export const computeSelectValuesBlockedByValidationRules = ({
  validationRules,
  record,
  fieldMetadataItem,
  optionValues,
  fields,
  fieldMetadataItems,
  now,
}: {
  validationRules: ValidationRule[];
  record: Record<string, unknown>;
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'name'>;
  optionValues: string[];
  fields: ValidationRuleFieldDescriptor[];
  fieldMetadataItems: Pick<
    FieldMetadataItem,
    'name' | 'isSystem' | 'defaultValue'
  >[];
  now: string;
}): { blockedOptionValues: string[]; isEmptyValueBlocked: boolean } => {
  // A rule reading a value the record does not hold yet is left to the server
  const evaluableRulesBlamingField = validationRules.filter(
    (validationRule) => {
      if (
        !validationRule.isActive ||
        validationRule.errorFieldMetadataId !== fieldMetadataItem.id
      ) {
        return false;
      }

      const compilationResult = compileValidationRuleExpression({
        expression: validationRule.expression,
        fields,
      });

      return (
        compilationResult.isValid &&
        Object.keys(compilationResult.bindings).every(
          (bindingPath) =>
            bindingPath === fieldMetadataItem.name ||
            isRecordPathLoaded({
              record,
              path:
                getValidationRulePreviousValueFieldPath(bindingPath) ??
                bindingPath,
            }),
        )
      );
    },
  );

  if (evaluableRulesBlamingField.length === 0) {
    return { blockedOptionValues: [], isEmptyValueBlocked: false };
  }

  const isValueBlocked = (value: string | null) =>
    computeDraftValidationRuleViolations({
      validationRules: evaluableRulesBlamingField,
      draftRecord: { ...record, [fieldMetadataItem.name]: value },
      previousRecord: record,
      fields,
      fieldMetadataItems,
      now,
    }).length > 0;

  return {
    blockedOptionValues: optionValues.filter(isValueBlocked),
    isEmptyValueBlocked: isValueBlocked(null),
  };
};
