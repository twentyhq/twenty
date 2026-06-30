import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type NavigateFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const navigate: NavigateFunction = (
  to,
  params,
  queryParams,
  options,
) => {
  const navigateFunction = frontComponentHostCommunicationApi.navigate;

  if (!isDefined(navigateFunction)) {
    throw new Error('navigateFunction is not set');
  }

  return navigateFunction(to, params, queryParams, options);
};
