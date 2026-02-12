import { type AppPath, type NavigateOptions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type NavigateFunction = (
  to: AppPath,
  params?: Record<string, string | null>,
  queryParams?: Record<string, unknown>,
  options?: NavigateOptions,
) => Promise<void>;

let navigateFunction: NavigateFunction | undefined;

export const setNavigate = (fn: NavigateFunction): void => {
  navigateFunction = fn;
};

export const navigate: NavigateFunction = (
  to: AppPath,
  params?: Record<string, string | null>,
  queryParams?: Record<string, unknown>,
  options?: NavigateOptions,
): Promise<void> => {
  if (!isDefined(navigateFunction)) {
    throw new Error('navigateFunction is not set');
  }
  return navigateFunction(to, params, queryParams, options);
};
