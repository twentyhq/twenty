import { matchPath } from 'react-router-dom';

import { isNonEmptyString } from '@sniptt/guards';
import { type AppBasePath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const addTrailingSlash = (path: string) =>
  path.endsWith('/') ? path : path + '/';

const getConstructedPath = (path: string, basePath?: AppBasePath) => {
  if (!isNonEmptyString(basePath)) return path;

  return addTrailingSlash(basePath) + path;
};

export const isMatchingPathname = (
  pathname: string,
  path: string,
  basePath?: AppBasePath,
): boolean =>
  isDefined(matchPath(getConstructedPath(path, basePath), pathname));
