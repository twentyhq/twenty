import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type DraftValidationRuleViolation } from '@/validation-rules/types/DraftValidationRuleViolation';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { isUndefined } from '@sniptt/guards';
import {
  fieldMetadataDefaultValueFunctionName,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  evaluateValidationRuleExpression,
  getValidationRuleReadFieldPaths,
  isDefined,
} from 'twenty-shared/utils';
import { stripSimpleQuotesFromStringRecursive } from '~/utils/string/stripSimpleQuotesFromString';

type DraftFieldMetadataItem = Pick<
  FieldMetadataItem,
  'name' | 'isSystem' | 'defaultValue'
>;

const FUNCTION_DEFAULT_VALUES = Object.values(
  fieldMetadataDefaultValueFunctionName,
);

const isServerFilledField = (
  fieldMetadataItem: DraftFieldMetadataItem,
): boolean =>
  fieldMetadataItem.isSystem ||
  FUNCTION_DEFAULT_VALUES.includes(fieldMetadataItem.defaultValue);

const withStaticDefaultValues = ({
  draftRecord,
  fieldMetadataItems,
}: {
  draftRecord: Record<string, unknown>;
  fieldMetadataItems: DraftFieldMetadataItem[];
}): Record<string, unknown> => ({
  ...Object.fromEntries(
    fieldMetadataItems
      .filter(
        (fieldMetadataItem) =>
          isDefined(fieldMetadataItem.defaultValue) &&
          !isServerFilledField(fieldMetadataItem),
      )
      .map((fieldMetadataItem) => [
        fieldMetadataItem.name,
        stripSimpleQuotesFromStringRecursive(fieldMetadataItem.defaultValue),
      ]),
  ),
  ...Object.fromEntries(
    Object.entries(draftRecord).filter(
      ([, draftValue]) => !isUndefined(draftValue),
    ),
  ),
});

const canEvaluateOnDraft = ({
  validationRule,
  fields,
  draftRecord,
  serverFilledFieldNames,
}: {
  validationRule: ValidationRule;
  fields: ValidationRuleFieldDescriptor[];
  draftRecord: Record<string, unknown>;
  serverFilledFieldNames: string[];
}): boolean => {
  const readFieldPaths = getValidationRuleReadFieldPaths({
    expression: validationRule.expression,
    bindings: validationRule.bindings,
    fields,
  });

  const isEveryReferencedRelationLoaded = readFieldPaths
    .filter((readFieldPath) => readFieldPath.includes('.'))
    .map((readFieldPath) => readFieldPath.split('.')[0])
    .every((relationFieldName) => {
      const relatedRecord = draftRecord[relationFieldName];

      return typeof relatedRecord === 'object' && isDefined(relatedRecord);
    });

  const isEveryServerFilledFieldInDraft = readFieldPaths
    .map((readFieldPath) => readFieldPath.split('.')[0])
    .filter((fieldName) => serverFilledFieldNames.includes(fieldName))
    .every((fieldName) => fieldName in draftRecord);

  return isEveryReferencedRelationLoaded && isEveryServerFilledFieldInDraft;
};

const withRelationPresenceFromJoinColumns = ({
  draftRecord,
  fields,
}: {
  draftRecord: Record<string, unknown>;
  fields: ValidationRuleFieldDescriptor[];
}): Record<string, unknown> =>
  fields
    .filter((field) => isDefined(field.relationTargetFields))
    .reduce<Record<string, unknown>>((evaluationRecord, relationField) => {
      const joinColumnValue = draftRecord[`${relationField.name}Id`];

      if (
        isDefined(evaluationRecord[relationField.name]) ||
        !isDefined(joinColumnValue)
      ) {
        return evaluationRecord;
      }

      return {
        ...evaluationRecord,
        [relationField.name]: { id: joinColumnValue },
      };
    }, draftRecord);

export const computeDraftValidationRuleViolations = ({
  validationRules,
  draftRecord,
  fields,
  fieldMetadataItems,
  now,
}: {
  validationRules: ValidationRule[];
  draftRecord: Record<string, unknown>;
  fields: ValidationRuleFieldDescriptor[];
  fieldMetadataItems: DraftFieldMetadataItem[];
  now: string;
}): DraftValidationRuleViolation[] => {
  const draftRecordWithDefaultValues = withStaticDefaultValues({
    draftRecord,
    fieldMetadataItems,
  });

  const serverFilledFieldNames = fieldMetadataItems
    .filter(isServerFilledField)
    .map((fieldMetadataItem) => fieldMetadataItem.name);

  return validationRules
    .filter((validationRule) => validationRule.isActive)
    .filter((validationRule) =>
      canEvaluateOnDraft({
        validationRule,
        fields,
        draftRecord: draftRecordWithDefaultValues,
        serverFilledFieldNames,
      }),
    )
    .filter(
      (validationRule) =>
        evaluateValidationRuleExpression({
          expression: validationRule.expression,
          bindings: validationRule.bindings,
          record: withRelationPresenceFromJoinColumns({
            draftRecord: draftRecordWithDefaultValues,
            fields,
          }),
          fields,
          now,
        }).status === 'failed',
    )
    .map((validationRule) => ({
      ruleId: validationRule.id,
      message: validationRule.message,
    }));
};
