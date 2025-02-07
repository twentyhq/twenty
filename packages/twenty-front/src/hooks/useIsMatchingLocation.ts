import { matchPath, useLocation } from 'react-router-dom';

import { AppBasePath } from '@/types/AppBasePath';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared';
import { useCallback } from 'react';

export const useIsMatchingLocation = () => {
  const location = useLocation();

  // Infinite loop issue caused by `checkUserExistsQuery` in `useSignInUp`.
  // Without executing this query, there is no infinite loop.
  // I also noticed that in `isMatchingLocation` inside `continueWithEmail`, no loop occurs.
  // Both functions are called within the `useEffect` of `SignInUpWorkspaceScopeFormEffect`.
  // This led me to conclude that the issue comes from `useIsMatchingLocation`.
  // Using `useCallback` prevent the loop.
  const isMatchingLocation = useCallback(
    (path: string, basePath?: AppBasePath) => {
      const addTrailingSlash = (path: string) =>
        path.endsWith('/') ? path : path + '/';

      const getConstructedPath = (path: string, basePath?: AppBasePath) => {
        if (!isNonEmptyString(basePath)) return path;

        return addTrailingSlash(basePath) + path;
      };

      const match = matchPath(
        getConstructedPath(path, basePath),
        location.pathname,
      );
      return isDefined(match);
    },
    [location.pathname],
  );

  return {
    isMatchingLocation,
  };
};
