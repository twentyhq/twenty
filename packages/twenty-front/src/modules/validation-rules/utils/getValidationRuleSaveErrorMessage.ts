import { CombinedGraphQLErrors } from '@apollo/client/errors';

export const getValidationRuleSaveErrorMessage = (
  error: unknown,
): string | undefined =>
  error instanceof CombinedGraphQLErrors ? error.errors[0]?.message : undefined;
