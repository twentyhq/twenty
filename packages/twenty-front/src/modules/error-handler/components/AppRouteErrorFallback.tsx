import { useRouteError } from 'react-router-dom';

import { AppRootErrorFallback } from '@/error-handler/components/AppRootErrorFallback';
import { convertUnknownToError } from '@/error-handler/utils/convertUnknownToError';
import { reloadWindow } from '~/utils/reloadWindow';

export const AppRouteErrorFallback = () => {
  const routeError = useRouteError();

  return (
    <AppRootErrorFallback
      error={convertUnknownToError(routeError)}
      resetErrorBoundary={reloadWindow}
    />
  );
};
