import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export type ApplicationLookupStatus =
  | 'loading'
  | 'found'
  | 'not-found'
  | 'unavailable';

const NOT_FOUND_ERROR_CODE = 'NOT_FOUND';
const BAD_REQUEST_STATUS_CODE = 400;

const isNotFoundError = (error: unknown): boolean => {
  if (isGraphqlErrorOfType(error, NOT_FOUND_ERROR_CODE)) {
    return true;
  }

  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.length > 0;
  }

  return ServerError.is(error) && error.statusCode === BAD_REQUEST_STATUS_CODE;
};

export const getApplicationLookupStatus = ({
  identifier,
  isLoading,
  error,
  result,
}: {
  identifier: string | undefined;
  isLoading: boolean;
  error: unknown;
  result: unknown;
}): ApplicationLookupStatus => {
  if (!isNonEmptyString(identifier)) {
    return 'not-found';
  }

  if (isDefined(error)) {
    return isNotFoundError(error) ? 'not-found' : 'unavailable';
  }

  if (isDefined(result)) {
    return 'found';
  }

  return isLoading ? 'loading' : 'not-found';
};
