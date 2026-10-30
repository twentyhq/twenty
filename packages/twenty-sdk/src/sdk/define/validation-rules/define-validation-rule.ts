import { type ValidationRuleManifest } from 'twenty-shared/application';

import { type ValidationResult } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type RuleExpression } from '@/sdk/define/validation-rules/rule-expression';

export type ValidationRuleConfig = Omit<
  ValidationRuleManifest,
  'expression'
> & {
  expression: string | RuleExpression;
};

export const defineValidationRule = ({
  expression,
  ...config
}: ValidationRuleConfig): ValidationResult<ValidationRuleManifest> => {
  const errors: string[] = [];
  const source =
    typeof expression === 'string' ? expression : expression?.source;

  if (!config.universalIdentifier) {
    errors.push('ValidationRule must have a universalIdentifier');
  }

  if (!config.objectUniversalIdentifier) {
    errors.push('ValidationRule must have an objectUniversalIdentifier');
  }

  if (!config.name?.trim()) {
    errors.push('ValidationRule must have a name');
  }

  if (!source?.trim()) {
    errors.push('ValidationRule must have an expression');
  }

  if (!config.message?.trim()) {
    errors.push('ValidationRule must have a message');
  }

  return createValidationResult({
    config: { ...config, expression: source },
    errors,
  });
};
