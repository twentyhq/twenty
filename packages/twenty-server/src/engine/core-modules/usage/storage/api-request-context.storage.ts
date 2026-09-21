/* @license Enterprise */

import { AsyncLocalStorage } from 'async_hooks';

import { type ApiType } from 'src/engine/core-modules/usage/types/api-type.type';

const apiRequestContextStorage = new AsyncLocalStorage<{ apiType: ApiType }>();

export const withApiRequestContext = <T>(
  apiType: ApiType,
  fn: () => T | Promise<T>,
): T | Promise<T> => apiRequestContextStorage.run({ apiType }, fn);

export const getApiType = (): ApiType | undefined =>
  apiRequestContextStorage.getStore()?.apiType;
