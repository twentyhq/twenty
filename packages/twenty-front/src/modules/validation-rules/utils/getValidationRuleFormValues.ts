import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { renderValidationRuleExpression } from 'twenty-shared/utils';

import { VALIDATION_RULE_DEFAULT_ICON } from '@/validation-rules/constants/ValidationRuleDefaultIcon';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';

export const getValidationRuleFormValues = ({
  validationRule,
  fields,
}: {
  validationRule: ValidationRule;
  fields: ValidationRuleFieldDescriptor[];
}): ValidationRuleFormValues => ({
  name: validationRule.name,
  description: validationRule.description ?? null,
  icon: validationRule.icon ?? VALIDATION_RULE_DEFAULT_ICON,
  expression: renderValidationRuleExpression({
    expression: validationRule.expression,
    bindings: validationRule.bindings,
    fields,
  }),
  bindings: validationRule.bindings,
  message: validationRule.message,
  errorFieldMetadataId: validationRule.errorFieldMetadataId ?? null,
});
