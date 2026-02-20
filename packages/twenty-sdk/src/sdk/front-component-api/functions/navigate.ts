import { type AppPath, type NavigateOptions } from 'twenty-shared/types';
import { type getAppPath, isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type NavigateFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const setNavigate = (fn: NavigateFunction): void => {
  frontComponentHostCommunicationApi.navigate = fn;
};

export const navigate: NavigateFunction = <T extends AppPath>(
  to: T,
  params?: Parameters<typeof getAppPath<T>>[1],
  queryParams?: Record<string, any>,
  options?: NavigateOptions,
): Promise<void> => {
  const navigateFunction = frontComponentHostCommunicationApi.navigate;

  if (!isDefined(navigateFunction)) {
    throw new Error('navigateFunction is not set');
  }

  return navigateFunction(to, params, queryParams, options);
};
