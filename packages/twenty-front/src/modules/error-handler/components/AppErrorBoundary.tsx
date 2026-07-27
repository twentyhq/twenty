import { AppErrorBoundaryEffect } from '@/error-handler/components/internal/AppErrorBoundaryEffect';
import { checkIfItsAViteStaleChunkLazyLoadingError } from '@/error-handler/utils/checkIfItsAViteStaleChunkLazyLoadingError';
import { shouldTriggerStaleChunkReload } from '@/error-handler/utils/shouldTriggerStaleChunkReload';
import { type ErrorInfo, type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { type CustomError, isDefined } from 'twenty-shared/utils';
import { reloadWindow } from '~/utils/reloadWindow';

type AppErrorBoundaryProps = {
  children: ReactNode;
  FallbackComponent: React.ComponentType<FallbackProps>;
  resetOnLocationChange?: boolean;
};

const hasErrorCode = (
  error: Error | CustomError,
): error is CustomError & { code: string } => {
  return 'code' in error && isDefined(error.code);
};

const captureAppError = (error: Error | CustomError, info: ErrorInfo) => {
  import('@sentry/react')
    .then(({ captureException }) => {
      captureException(error, (scope) => {
        scope.setExtras({ info });

        const fingerprint = hasErrorCode(error) ? error.code : error.message;
        scope.setFingerprint([fingerprint]);
        error.name = error.message;
        return scope;
      });
    })
    .catch((sentryError) => {
      // oxlint-disable-next-line no-console
      console.error('Failed to capture exception with Sentry:', sentryError);
    });
};

export const AppErrorBoundary = ({
  children,
  FallbackComponent,
  resetOnLocationChange = true,
}: AppErrorBoundaryProps) => {
  const handleError = (error: Error | CustomError, info: ErrorInfo) => {
    captureAppError(error, info);

    const isViteStaleChunkLazyLoadingError =
      checkIfItsAViteStaleChunkLazyLoadingError(error);

    if (isViteStaleChunkLazyLoadingError && shouldTriggerStaleChunkReload()) {
      reloadWindow();
    }
  };

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
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};
