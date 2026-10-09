import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';
import { getGraphqlErrorExtensionsFromError } from '~/utils/get-graphql-error-extensions-from-error.util';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const getValidationRuleViolationsFromError = (
  error: unknown,
): ValidationRuleViolation[] => {
  if (!isGraphqlErrorOfType(error, 'VALIDATION_RULE_VIOLATION')) {
    return [];
  }

  const validationRuleViolations =
    getGraphqlErrorExtensionsFromError(error)?.validationRuleViolations;

  if (!Array.isArray(validationRuleViolations)) {
    return [];
  }

  return validationRuleViolations.flatMap((validationRuleViolation) =>
    isPlainObject(validationRuleViolation) &&
    isNonEmptyString(validationRuleViolation.ruleId) &&
    isNonEmptyString(validationRuleViolation.message)
      ? [
          {
            ruleId: validationRuleViolation.ruleId,
            message: validationRuleViolation.message,
            fieldMetadataId: isNonEmptyString(
              validationRuleViolation.fieldMetadataId,
            )
              ? validationRuleViolation.fieldMetadataId
              : null,
          },
        ]
      : [],
  );
};
