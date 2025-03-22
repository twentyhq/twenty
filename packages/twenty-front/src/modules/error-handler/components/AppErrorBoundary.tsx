import { AppErrorBoundaryEffect } from '@/error-handler/components/AppErrorBoundaryEffect';
import * as Sentry from '@sentry/react';
import { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

type AppErrorBoundaryProps = {
  children: ReactNode;
  FallbackComponent: React.ComponentType<FallbackProps>;
};

export const AppErrorBoundary = ({
  children,
  FallbackComponent,
}: AppErrorBoundaryProps) => {
  const handleError = (error: Error, info: ErrorInfo) => {
    Sentry.captureException(error, (scope) => {
      scope.setExtras({ info });
      return scope;
    });
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <>
          <AppErrorBoundaryEffect resetErrorBoundary={resetErrorBoundary} />
          <FallbackComponent
            error={error}
            resetErrorBoundary={resetErrorBoundary}
          />
        </>
      )}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};
