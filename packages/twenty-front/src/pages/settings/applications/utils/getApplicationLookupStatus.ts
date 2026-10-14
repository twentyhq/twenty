import { type ErrorLike } from '@apollo/client';
import { ServerError } from '@apollo/client/errors';
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

const isNotFoundError = (error: ErrorLike): boolean => {
  if (ServerError.is(error)) {
    return error.statusCode === BAD_REQUEST_STATUS_CODE;
  }

  return isGraphqlErrorOfType(error, NOT_FOUND_ERROR_CODE);
};

export const getApplicationLookupStatus = <TResult extends object>({
  identifier,
  isLoading,
  error,
  result,
}: {
  identifier: string | undefined;
  isLoading: boolean;
  error: ErrorLike | undefined;
  result: TResult | null | undefined;
}): ApplicationLookupStatus => {
  if (!isNonEmptyString(identifier)) {
    return 'not-found';
  }

  if (isDefined(result)) {
    return 'found';
  }

  if (isDefined(error)) {
    return isNotFoundError(error) ? 'not-found' : 'unavailable';
  }

  return isLoading ? 'loading' : 'not-found';
};
