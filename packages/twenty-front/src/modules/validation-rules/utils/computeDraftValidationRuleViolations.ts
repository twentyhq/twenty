import { type DraftValidationRuleViolation } from '@/validation-rules/types/DraftValidationRuleViolation';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  evaluateValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';

const isEveryReferencedRelationLoaded = ({
  expression,
  fields,
  draftRecord,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
  draftRecord: Record<string, unknown>;
}): boolean => {
  const compilationResult = compileValidationRuleExpression({
    expression,
    fields,
  });

  if (!compilationResult.isValid) {
    return false;
  }

  return Object.keys(compilationResult.bindings)
    .filter((bindingPath) => bindingPath.includes('.'))
    .map((bindingPath) => bindingPath.split('.')[0])
    .every((relationFieldName) => {
      const relatedRecord = draftRecord[relationFieldName];

      return typeof relatedRecord === 'object' && isDefined(relatedRecord);
    });
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

      return { ...evaluationRecord, [relationField.name]: { id: joinColumnValue } };
    }, draftRecord);

export const computeDraftValidationRuleViolations = ({
  validationRules,
  draftRecord,
  fields,
  now,
}: {
  validationRules: ValidationRule[];
  draftRecord: Record<string, unknown>;
  fields: ValidationRuleFieldDescriptor[];
  now: string;
}): DraftValidationRuleViolation[] =>
  validationRules
    .filter((validationRule) => validationRule.isActive)
    .filter((validationRule) =>
      isEveryReferencedRelationLoaded({
        expression: validationRule.expression,
        fields,
        draftRecord,
      }),
    )
    .filter(
      (validationRule) =>
        evaluateValidationRuleExpression({
          expression: validationRule.expression,
          record: withRelationPresenceFromJoinColumns({ draftRecord, fields }),
          fields,
          now,
        }).status === 'failed',
    )
    .map((validationRule) => ({
      ruleId: validationRule.id,
      message: validationRule.message,
      fieldMetadataId: validationRule.errorFieldMetadataId ?? null,
    }));
