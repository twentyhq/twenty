import { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';

export const AppErrorBoundary = ({ children }: { children: ReactNode }) => {
  const handleError = (error: Error, info: ErrorInfo) => {
    // TODO: log error to Sentry
    console.error('error', error, info);
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
