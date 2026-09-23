import { VALIDATION_RULE_FUNCTION_NAMES } from '@/validation-rules/constants/ValidationRuleFunctionNames';
import { VALIDATION_RULE_KEYWORDS } from '@/validation-rules/constants/ValidationRuleKeywords';
import {
  compositeTypeDefinitions,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const MEMBER_ACCESS_BEFORE_CURSOR = /([A-Za-z_]\w*)\.\w*$/;

export const computeValidationRuleCompletionLabels = ({
  textBeforeCursor,
  fields,
}: {
  textBeforeCursor: string;
  fields: ValidationRuleFieldDescriptor[];
}): string[] => {
  const memberAccessMatch = textBeforeCursor.match(MEMBER_ACCESS_BEFORE_CURSOR);

  if (!isDefined(memberAccessMatch)) {
    return [
      ...fields.map((field) => field.name),
      ...VALIDATION_RULE_FUNCTION_NAMES,
      ...VALIDATION_RULE_KEYWORDS,
    ];
  }

  const parentField = fields.find(
    (field) => field.name === memberAccessMatch[1],
  );

  if (!isDefined(parentField)) {
    return [];
  }

  if (isDefined(parentField.relationTargetFields)) {
    return parentField.relationTargetFields.map((field) => field.name);
  }

  return (
    compositeTypeDefinitions
      .get(parentField.type)
      ?.properties.map((property) => property.name) ?? []
  );
};
