import { type ErrorLike } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

import { getGraphqlErrorExtensionsFromError } from '~/utils/get-graphql-error-extensions-from-error.util';

export const isGraphqlErrorOfType = (
  error: unknown,
  errorCode: string,
): error is ErrorLike => {
  if (!isDefined(error) || typeof error !== 'object') {
    return false;
  }

  const extensions = getGraphqlErrorExtensionsFromError(error);

  return (
    (isDefined(extensions?.subCode) && extensions.subCode === errorCode) ||
    (isDefined(extensions?.code) && extensions.code === errorCode) ||
    ('code' in error && error.code === errorCode)
  );
};
