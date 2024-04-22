import { useCallback } from 'react';
import { matchPath } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { AppBasePath } from '@/types/AppBasePath';

export const useNavigate = () => {
  const history = createBrowserHistory();
  return history.push;
};

export const useLocation = () => {
  const history = createBrowserHistory();
  return history.location;
};

export const useIsMatchingLocation = () => {
  const location = useLocation();

  return useCallback(
    (path: string, basePath?: AppBasePath) => {
      const constructedPath = basePath
        ? new URL(basePath + path, document.location.origin).pathname ?? ''
        : path;

      return !!matchPath(constructedPath, location.pathname);
    },
    [location.pathname],
  );
};
