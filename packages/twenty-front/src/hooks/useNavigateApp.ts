import { useCallback, useContext } from 'react';
import { type AppPath, type NavigateOptions } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, getAppPath } from 'twenty-shared/utils';

import { AppNavigatorContext } from '@/app/contexts/AppNavigatorContext';

type NavigateAppOptions = NavigateOptions;

// Stable across renders so effects can depend on it.
export const useNavigateApp = () => {
  const appNavigator = useContext(AppNavigatorContext);

  return useCallback(
    <T extends AppPath>(
      to: T,
      params?: Parameters<typeof getAppPath<T>>[1],
      queryParams?: Record<string, any>,
      options?: NavigateAppOptions,
    ) => {
      assertIsDefinedOrThrow(appNavigator);

      const path = getAppPath(to, params, queryParams);

      if (options?.replace === true) {
        appNavigator.replace(path, options.state, options);

        return;
      }

      appNavigator.push(path, options?.state, options);
    },
    [appNavigator],
  );
};
