import { matchPath, useLocation } from 'react-router-dom';
import { parse } from 'url';

import { AppBasePath } from '@/types/AppBasePath';

export const useIsMatchingLocation = () => {
  const location = useLocation();

  return (path: string, basePath?: AppBasePath) => {
    const constructedPath = basePath
      ? parse(`${basePath}/${path}`).pathname ?? ''
      : path;

    return !!matchPath(constructedPath, location.pathname);
  };
};
