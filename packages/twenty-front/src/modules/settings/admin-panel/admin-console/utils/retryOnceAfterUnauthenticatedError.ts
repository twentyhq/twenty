import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { isUnauthenticatedGraphQLError } from '@/apollo/utils/isUnauthenticatedGraphQLError';

// A dead session cookie fails the request before any resolver runs; the server clears it in that response, so one retry starts clean.
export const retryOnceAfterUnauthenticatedError = async <TResult>(
  attempt: () => Promise<TResult>,
): Promise<TResult> => {
  try {
    return await attempt();
  } catch (error) {
    if (
      !CombinedGraphQLErrors.is(error) ||
      !error.errors.some(isUnauthenticatedGraphQLError)
    ) {
      throw error;
    }

    return attempt();
  }
};
