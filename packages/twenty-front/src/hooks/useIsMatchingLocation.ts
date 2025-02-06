import { matchPath, useLocation } from 'react-router-dom';

import { AppBasePath } from '@/types/AppBasePath';

export const useIsMatchingLocation = () => {
  const location = useLocation();

  const addTrailingSlash = (path: string) =>
    path.endsWith('/') ? path : path + '/';

  const getConstructedPath = (path: string, basePath?: AppBasePath) => {
    if (!basePath) return path;

    return addTrailingSlash(basePath) + path;
  };

  return (path: string, basePath?: AppBasePath) => {
    console.log(
      '>>>>>>>>>>>>>>',
      getConstructedPath(path, basePath),
      location.pathname,
    );
    return !!matchPath(getConstructedPath(path, basePath), location.pathname);
  };
};
