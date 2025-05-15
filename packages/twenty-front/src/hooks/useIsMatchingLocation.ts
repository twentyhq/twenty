import { matchPath, useLocation } from 'react-router-dom';

import { AppBasePath } from '@/types/AppBasePath';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

const addTrailingSlash = (path: string) =>
  path.endsWith('/') ? path : path + '/';

const getConstructedPath = (path: string, basePath?: AppBasePath) => {
  if (!isNonEmptyString(basePath)) return path;

  return addTrailingSlash(basePath) + path;
};

export const useIsMatchingLocation = () => {
  const location = useLocation();

  const isMatchingLocation = useCallback(
    (path: string, basePath?: AppBasePath) => {
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
