import { AppErrorBoundaryEffect } from '@/error-handler/components/internal/AppErrorBoundaryEffect';
import { checkIfItsAViteStaleChunkLazyLoadingError } from '@/error-handler/utils/checkIfItsAViteStaleChunkLazyLoadingError';
import { type ErrorInfo, type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { type CustomError, isDefined } from 'twenty-shared/utils';

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

const isMaximumUpdateDepthError = (error: Error | CustomError) => {
  return error.message.includes('Maximum update depth exceeded');
};

const getReactErrorBoundaryComponentName = (info: ErrorInfo) => {
  const firstComponentLine = info.componentStack
    .split('\n')
    .find((line) => line.trim().startsWith('at '));

  if (!isDefined(firstComponentLine)) {
    return null;
  }

  return firstComponentLine.replace('at ', '').trim().split(' ')[0] ?? null;
};

export const AppErrorBoundary = ({
  children,
  FallbackComponent,
  resetOnLocationChange = true,
}: AppErrorBoundaryProps) => {
  const handleError = async (error: Error | CustomError, info: ErrorInfo) => {
    try {
      const { captureException } = await import('@sentry/react');
      captureException(error, (scope) => {
        scope.setExtras({ info });

        const fingerprint = hasErrorCode(error) ? error.code : error.message;
        scope.setFingerprint([fingerprint]);

        if (isMaximumUpdateDepthError(error)) {
          const componentName = getReactErrorBoundaryComponentName(info);

          scope.setTag('react-error-type', 'maximum-update-depth');

          if (isDefined(componentName)) {
            scope.setTag('react-component', componentName);
            scope.setFingerprint([
              'react-runtime-error',
              'maximum-update-depth',
              componentName,
            ]);
          } else {
            scope.setFingerprint([
              'react-runtime-error',
              'maximum-update-depth',
            ]);
          }
        }

        error.name = error.message;
        return scope;
      });
    } catch (sentryError) {
      // oxlint-disable-next-line no-console
      console.error('Failed to capture exception with Sentry:', sentryError);
    }

    const isViteStaleChunkLazyLoadingError =
      checkIfItsAViteStaleChunkLazyLoadingError(error);

    if (isViteStaleChunkLazyLoadingError) {
      window.location.reload();
    }
  };

  const handleReset = () => {
    window.location.reload();
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
