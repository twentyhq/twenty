import { VALIDATION_RULE_DEFAULT_ICON } from '@/validation-rules/constants/ValidationRuleDefaultIcon';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';

export const getValidationRuleFormValues = (
  validationRule: ValidationRule,
): ValidationRuleFormValues => ({
  name: validationRule.name,
  description: validationRule.description ?? null,
  icon: validationRule.icon ?? VALIDATION_RULE_DEFAULT_ICON,
  expression: validationRule.expression,
  message: validationRule.message,
  errorFieldMetadataId: validationRule.errorFieldMetadataId ?? null,
});
