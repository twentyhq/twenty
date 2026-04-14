import { isDefined } from 'twenty-shared/utils';

import { getGraphqlErrorExtensionsFromError } from '~/utils/get-graphql-error-extensions-from-error.util';

export const isGraphqlErrorOfType = (
  error: unknown,
  errorCode: string,
): boolean => {
  const extensions = getGraphqlErrorExtensionsFromError(error);

  return (
    (isDefined(extensions?.subCode) && extensions.subCode === errorCode) ||
    (isDefined(extensions?.code) && extensions.code === errorCode) ||
    (isDefined(error) &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === errorCode)
  );
};
