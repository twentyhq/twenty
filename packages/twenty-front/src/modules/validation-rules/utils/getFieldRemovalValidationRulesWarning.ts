import { t } from '@lingui/core/macro';

import { type ValidationRule } from '@/validation-rules/types/ValidationRule';

export const getFieldRemovalValidationRulesWarning = (
  validationRulesReadingField: ValidationRule[],
): string => {
  const validationRuleNames = validationRulesReadingField
    .map(({ name }) => name)
    .join(', ');

  return validationRulesReadingField.length === 1
    ? t`This will also deactivate the validation rule ${validationRuleNames}.`
    : t`This will also deactivate these validation rules: ${validationRuleNames}.`;
};
