import { Location, matchPath } from 'react-router-dom';

import { AppBasePath } from '@/types/AppBasePath';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const addTrailingSlash = (path: string) =>
  path.endsWith('/') ? path : path + '/';

const getConstructedPath = (path: string, basePath?: AppBasePath) => {
  if (!isNonEmptyString(basePath)) return path;

  return addTrailingSlash(basePath) + path;
};

export const isMatchingLocation = (
  location: Location,
  path: string,
  basePath?: AppBasePath,
): boolean => {
  const match = matchPath(
    getConstructedPath(path, basePath),
    location.pathname,
  );
  return isDefined(match);
};
