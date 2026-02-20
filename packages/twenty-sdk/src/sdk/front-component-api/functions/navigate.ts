import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type NavigateFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const navigate: NavigateFunction = (params) => {
  const navigateFunction = frontComponentHostCommunicationApi.navigate;

  if (!isDefined(navigateFunction)) {
    throw new Error('navigateFunction is not set');
  }

  return navigateFunction(params);
};
