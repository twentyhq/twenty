import { type DraftValidationRuleViolation } from '@/validation-rules/types/DraftValidationRuleViolation';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  buildValidationRuleEmptySetAggregateValues,
  compileValidationRuleExpression,
  evaluateValidationRuleExpression,
  extractValidationRuleAggregates,
  isDefined,
} from 'twenty-shared/utils';

const canEvaluateOnDraft = ({
  expression,
  fields,
  draftRecord,
  serverFilledFieldNames,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
  draftRecord: Record<string, unknown>;
  serverFilledFieldNames: string[];
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

  const isEveryServerFilledFieldInDraft = bindingPaths
    .map((bindingPath) => bindingPath.split('.')[0])
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
  serverFilledFieldNames,
  now,
}: {
  validationRules: ValidationRule[];
  draftRecord: Record<string, unknown>;
  fields: ValidationRuleFieldDescriptor[];
  serverFilledFieldNames: string[];
  now: string;
}): DraftValidationRuleViolation[] =>
  validationRules
    .filter((validationRule) => validationRule.isActive)
    .filter((validationRule) =>
      canEvaluateOnDraft({
        expression: validationRule.expression,
        fields,
        draftRecord,
        serverFilledFieldNames,
      }),
    )
    .filter(
      (validationRule) =>
        evaluateValidationRuleExpression({
          expression: validationRule.expression,
          record: {
            ...withRelationPresenceFromJoinColumns({ draftRecord, fields }),
            ...buildValidationRuleEmptySetAggregateValues(
              extractValidationRuleAggregates(validationRule.expression),
            ),
          },
          fields,
          now,
        }).status === 'failed',
    )
    .map((validationRule) => ({
      ruleId: validationRule.id,
      message: validationRule.message,
      fieldMetadataId: validationRule.errorFieldMetadataId ?? null,
    }));
