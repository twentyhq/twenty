import { tokenizeValidationRuleExpression } from 'twenty-shared/utils';

import { type ValidationRule } from '@/validation-rules/types/ValidationRule';

export const getActiveValidationRulesReadingField = ({
  validationRules,
  fieldName,
}: {
  validationRules: ValidationRule[];
  fieldName: string;
}): ValidationRule[] =>
  validationRules.filter(
    ({ isActive, expression }) =>
      isActive &&
      tokenizeValidationRuleExpression(expression).some(
        ({ type, text }) => type === 'path' && text.split('.')[0] === fieldName,
      ),
  );
