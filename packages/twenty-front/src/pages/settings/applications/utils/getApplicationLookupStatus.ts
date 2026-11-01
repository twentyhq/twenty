import { type ErrorLike } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import { isUuidFormat } from '~/pages/settings/applications/utils/isUuidFormat';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export type ApplicationLookupStatus =
  | 'loading'
  | 'found'
  | 'not-found'
  | 'unavailable';

const NOT_FOUND_ERROR_CODE = 'NOT_FOUND';

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
  if (!isUuidFormat(identifier)) {
    return 'not-found';
  }

  if (isDefined(result)) {
    return 'found';
  }

  if (isDefined(error)) {
    return isGraphqlErrorOfType(error, NOT_FOUND_ERROR_CODE)
      ? 'not-found'
      : 'unavailable';
  }

  return isLoading ? 'loading' : 'not-found';
};
