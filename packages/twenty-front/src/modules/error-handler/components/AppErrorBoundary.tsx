import { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';

import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';

export const AppErrorBoundary = ({ children }: { children: ReactNode }) => {
  const handleError = (_error: Error, _info: ErrorInfo) => {
    Sentry.captureException(_error, (scope) => {
      scope.setExtras({ _info });
      return scope;
    });
  };

  return (
    <ErrorBoundary
      FallbackComponent={GenericErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};
