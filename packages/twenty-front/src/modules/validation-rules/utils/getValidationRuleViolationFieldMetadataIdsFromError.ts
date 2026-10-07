import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

export const getValidationRuleViolationFieldMetadataIdsFromError = (
  error: unknown,
): string[] => {
  if (!CombinedGraphQLErrors.is(error)) {
    return [];
  }

  return error.errors.flatMap(({ extensions }) => {
    const validationRuleViolations = extensions?.validationRuleViolations;

    if (!Array.isArray(validationRuleViolations)) {
      return [];
    }

    return validationRuleViolations.flatMap((validationRuleViolation) =>
      isPlainObject(validationRuleViolation) &&
      isNonEmptyString(validationRuleViolation.fieldMetadataId)
        ? [validationRuleViolation.fieldMetadataId]
        : [],
    );
  });
};
