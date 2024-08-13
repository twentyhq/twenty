import { useCallback } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

import { AppBasePath } from '@/types/AppBasePath';

export const useIsMatchingLocation = () => {
  const location = useLocation();

  return useCallback(
    (path: string, basePath?: AppBasePath) => {
      const constructedPath = basePath
        ? (new URL(basePath + path, document.location.origin).pathname ?? '')
        : path;

      return !!matchPath(constructedPath, location.pathname);
    },
    [location.pathname],
  );
};
