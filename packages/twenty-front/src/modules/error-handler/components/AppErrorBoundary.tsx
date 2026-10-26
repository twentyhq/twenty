import { AppErrorBoundaryEffect } from '@/error-handler/components/internal/AppErrorBoundaryEffect';
import { handleAppError } from '@/error-handler/utils/handleAppError';
import { type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { reloadWindow } from '~/utils/reloadWindow';

type AppErrorBoundaryProps = {
  children: ReactNode;
  FallbackComponent: React.ComponentType<FallbackProps>;
  resetOnLocationChange?: boolean;
};

export const AppErrorBoundary = ({
  children,
  FallbackComponent,
  resetOnLocationChange = true,
}: AppErrorBoundaryProps) => {
  const handleReset = () => {
    reloadWindow();
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <>
          {resetOnLocationChange && (
            <AppErrorBoundaryEffect resetErrorBoundary={resetErrorBoundary} />
          )}
          <FallbackComponent
            error={error}
            resetErrorBoundary={resetErrorBoundary}
          />
        </>
      )}
      onError={(error, errorInfo) => handleAppError({ error, errorInfo })}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};
