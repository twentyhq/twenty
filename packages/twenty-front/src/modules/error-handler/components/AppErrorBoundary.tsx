import { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';

export const AppErrorBoundary = ({ children }: { children: ReactNode }) => {
  const handleError = (_error: Error, _info: ErrorInfo) => {
    // TODO: log error to Sentry
  };

  return (
    <ErrorBoundary
      key={window.location.pathname}
      FallbackComponent={GenericErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};
