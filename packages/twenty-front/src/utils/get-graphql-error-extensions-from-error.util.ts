import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { isDefined } from 'twenty-shared/utils';

export const getGraphqlErrorExtensionsFromError = (
  error: unknown,
): Record<string, unknown> | undefined => {
  if (CombinedGraphQLErrors.is(error)) {
    const extensions = error.errors?.[0]?.extensions;

    return isDefined(extensions)
      ? (extensions as Record<string, unknown>)
      : undefined;
  }

  if (
    isDefined(error) &&
    typeof error === 'object' &&
    'extensions' in error &&
    isDefined(error.extensions) &&
    typeof error.extensions === 'object'
  ) {
    return error.extensions as Record<string, unknown>;
  }

  return undefined;
};
