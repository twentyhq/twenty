import * as Sentry from '@sentry/react';
import { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';
import { SettingsErrorFallback } from '@/error-handler/components/SettingsErrorFallback';

type AppErrorBoundaryProps = {
  children: ReactNode;
  isSettingsRoute?: boolean;
};
export const AppErrorBoundary = ({
  children,
  isSettingsRoute = false,
}: AppErrorBoundaryProps) => {
  const handleError = (_error: Error, _info: ErrorInfo) => {
    Sentry.captureException(_error, (scope) => {
      scope.setExtras({ _info });
      return scope;
    });
  };

  return (
    <ErrorBoundary
      FallbackComponent={
        isSettingsRoute ? SettingsErrorFallback : GenericErrorFallback
      }
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};
