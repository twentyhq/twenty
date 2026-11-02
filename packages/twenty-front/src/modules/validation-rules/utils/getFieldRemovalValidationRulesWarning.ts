import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ValidationRule } from '@/validation-rules/types/ValidationRule';

export const getFieldRemovalValidationRulesWarning = ({
  validationRulesReadingField,
  hasFailedToLoad,
}: {
  validationRulesReadingField: ValidationRule[];
  hasFailedToLoad: boolean;
}): string | undefined => {
  if (hasFailedToLoad) {
    return t`We couldn't check which validation rules use this field. This may also deactivate them.`;
  }

  if (!isNonEmptyArray(validationRulesReadingField)) {
    return undefined;
  }

  const validationRuleNames = validationRulesReadingField
    .map(({ name }) => name)
    .join(', ');

  return validationRulesReadingField.length === 1
    ? t`This will also deactivate the validation rule ${validationRuleNames}.`
    : t`This will also deactivate these validation rules: ${validationRuleNames}.`;
};
