import { useEffect, useMemo } from 'react';
import { useRouteError } from 'react-router-dom';

import { AppRootErrorFallback } from '@/error-handler/components/AppRootErrorFallback';
import { handleAppError } from '@/error-handler/utils/handleAppError';
import { reloadWindow } from '~/utils/reloadWindow';

export const AppRouteErrorFallback = () => {
  const routeError = useRouteError();

  const error = useMemo(
    () =>
      routeError instanceof Error ? routeError : new Error(String(routeError)),
    [routeError],
  );

  useEffect(() => {
    handleAppError({ error });
  }, [error]);

  return (
    <AppRootErrorFallback error={error} resetErrorBoundary={reloadWindow} />
  );
};
