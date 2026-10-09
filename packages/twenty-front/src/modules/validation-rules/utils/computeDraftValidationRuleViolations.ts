import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import {
  fieldMetadataDefaultValueFunctionName,
  FieldMetadataType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  evaluateValidationRuleExpression,
  isDefined,
  isPlainObject,
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

const IS_DRAFT_VALUE_COMPLETED_BY_SERVER_BY_FIELD_TYPE: Partial<
  Record<FieldMetadataType, (draftValue: unknown) => boolean>
> = {
  [FieldMetadataType.RICH_TEXT]: (draftValue) =>
    isPlainObject(draftValue) &&
    isNonEmptyString(draftValue.blocknote) &&
    !isNonEmptyString(draftValue.markdown),
};

const computeFieldNamesResolvedByServer = ({
  draftRecord,
  fields,
  fieldMetadataItems,
}: {
  draftRecord: Record<string, unknown>;
  fields: ValidationRuleFieldDescriptor[];
  fieldMetadataItems: DraftFieldMetadataItem[];
}): string[] => [
  ...fieldMetadataItems
    .filter(
      (fieldMetadataItem) =>
        isServerFilledField(fieldMetadataItem) &&
        !(fieldMetadataItem.name in draftRecord),
    )
    .map((fieldMetadataItem) => fieldMetadataItem.name),
  ...fields
    .filter(
      (field) =>
        IS_DRAFT_VALUE_COMPLETED_BY_SERVER_BY_FIELD_TYPE[field.type]?.(
          draftRecord[field.name],
        ) === true,
    )
    .map((field) => field.name),
];

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
  expression,
  fields,
  draftRecord,
  fieldNamesResolvedByServer,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
  draftRecord: Record<string, unknown>;
  fieldNamesResolvedByServer: string[];
}): boolean => {
  const compilationResult = compileValidationRuleExpression({
    expression,
    fields,
  });

  if (!compilationResult.isValid) {
    return false;
  }

  const bindingPaths = Object.keys(compilationResult.bindings);

  const isEveryReferencedRelationLoaded = bindingPaths
    .filter((bindingPath) => bindingPath.includes('.'))
    .map((bindingPath) => bindingPath.split('.')[0])
    .every((relationFieldName) => {
      const relatedRecord = draftRecord[relationFieldName];

      return typeof relatedRecord === 'object' && isDefined(relatedRecord);
    });

  const isNoReferencedFieldResolvedByServer = bindingPaths
    .map((bindingPath) => bindingPath.split('.')[0])
    .every((fieldName) => !fieldNamesResolvedByServer.includes(fieldName));

  return isEveryReferencedRelationLoaded && isNoReferencedFieldResolvedByServer;
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
}): ValidationRuleViolation[] => {
  const draftRecordWithDefaultValues = withStaticDefaultValues({
    draftRecord,
    fieldMetadataItems,
  });

  const fieldNamesResolvedByServer = computeFieldNamesResolvedByServer({
    draftRecord: draftRecordWithDefaultValues,
    fields,
    fieldMetadataItems,
  });

  return validationRules
    .filter((validationRule) => validationRule.isActive)
    .filter((validationRule) =>
      canEvaluateOnDraft({
        expression: validationRule.expression,
        fields,
        draftRecord: draftRecordWithDefaultValues,
        fieldNamesResolvedByServer,
      }),
    )
    .filter(
      (validationRule) =>
        evaluateValidationRuleExpression({
          expression: validationRule.expression,
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
      fieldMetadataId: validationRule.errorFieldMetadataId ?? null,
    }));
};
