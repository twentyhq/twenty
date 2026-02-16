import { type AppPath, type NavigateOptions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type NavigateFunction = (
  to: AppPath,
  params?: Record<string, string | null>,
  queryParams?: Record<string, unknown>,
  options?: NavigateOptions,
) => Promise<void>;

// State is stored on globalThis so the worker's SDK instance and each
// front component's bundled SDK copy share the same backing store.
const NAVIGATE_KEY = '__twentySdkNavigateFunction__';

export const setNavigate = (fn: NavigateFunction): void => {
  (globalThis as Record<string, unknown>)[NAVIGATE_KEY] = fn;
};

export const navigate: NavigateFunction = (
  to: AppPath,
  params?: Record<string, string | null>,
  queryParams?: Record<string, unknown>,
  options?: NavigateOptions,
): Promise<void> => {
  const navigateFunction = (globalThis as Record<string, unknown>)[
    NAVIGATE_KEY
  ] as NavigateFunction | undefined;

  if (!isDefined(navigateFunction)) {
    throw new Error('navigateFunction is not set');
  }

  return navigateFunction(to, params, queryParams, options);
};
