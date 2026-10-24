import { useMemo } from 'react';
import { useRouteError } from 'react-router-dom';

import { AppRootErrorFallback } from '@/error-handler/components/AppRootErrorFallback';
import { AppRouteErrorReportEffect } from '@/error-handler/components/internal/AppRouteErrorReportEffect';
import { reloadWindow } from '~/utils/reloadWindow';

export const AppRouteErrorFallback = () => {
  const routeError = useRouteError();

  const error = useMemo(
    () =>
      routeError instanceof Error ? routeError : new Error(String(routeError)),
    [routeError],
  );

  return (
    <>
      <AppRouteErrorReportEffect error={error} />
      <AppRootErrorFallback error={error} resetErrorBoundary={reloadWindow} />
    </>
  );
};
