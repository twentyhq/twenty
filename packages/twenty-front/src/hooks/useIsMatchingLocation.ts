import { matchPath, useLocation } from 'react-router-dom';

import { AppBasePath } from '@/types/AppBasePath';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared';

export const useIsMatchingLocation = () => {
  const location = useLocation();

  const addTrailingSlash = (path: string) =>
    path.endsWith('/') ? path : path + '/';

  const getConstructedPath = (path: string, basePath?: AppBasePath) => {
    if (!isNonEmptyString(basePath)) return path;

    return addTrailingSlash(basePath) + path;
  };

  const isMatchingLocation = (path: string, basePath?: AppBasePath) => {
    const match = matchPath(
      getConstructedPath(path, basePath),
      location.pathname,
    );
    return isDefined(match);
  };

  return {
    isMatchingLocation,
  };
};
