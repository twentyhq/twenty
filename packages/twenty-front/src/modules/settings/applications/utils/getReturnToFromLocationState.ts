import { isDefined } from 'twenty-shared/utils';

import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';

export const getReturnToFromLocationState = (
  locationState: unknown,
): string | undefined => {
  if (typeof locationState !== 'object' || !isDefined(locationState)) {
    return undefined;
  }

  if (!('returnTo' in locationState)) {
    return undefined;
  }

  const { returnTo } = locationState;

  if (typeof returnTo !== 'string' || !isValidReturnToPath(returnTo)) {
    return undefined;
  }

  return returnTo;
};
