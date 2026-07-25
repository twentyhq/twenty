import { AppErrorBoundaryEffect } from '@/error-handler/components/internal/AppErrorBoundaryEffect';
import { LazyRouteComponentResolutionError } from '@/error-handler/errors/LazyRouteComponentResolutionError';
import { checkIfItsAViteStaleChunkLazyLoadingError } from '@/error-handler/utils/checkIfItsAViteStaleChunkLazyLoadingError';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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

const nonCriticalErrorCodes = new Set(['INVALID_DATE_TIME_FILTER_VALUE']);

const getLastRequestedChunkUrl = () => {
  const resourceEntries = performance.getEntriesByType('resource');

  return [...resourceEntries]
    .reverse()
    .find(
      (entry) =>
        'initiatorType' in entry &&
        (entry as PerformanceResourceTiming).initiatorType === 'script',
    )?.name;
};

export const AppErrorBoundary = ({
  children,
  FallbackComponent,
  resetOnLocationChange = true,
}: AppErrorBoundaryProps) => {
  const sentryConfig = useAtomStateValue(sentryConfigState);

  const handleError = async (error: Error | CustomError, info: ErrorInfo) => {
    try {
      const { captureException } = await import('@sentry/react');
      captureException(error, (scope) => {
        scope.setExtras({ info });

        const fingerprint = hasErrorCode(error) ? error.code : error.message;
        scope.setFingerprint([fingerprint]);

        if (hasErrorCode(error) && nonCriticalErrorCodes.has(error.code)) {
          scope.setLevel('warning');
          scope.setTag('error-expectedness', 'expected-invalid-filter-value');
        }

        if (error instanceof LazyRouteComponentResolutionError) {
          scope.setTag('error-handler', 'lazy-route-component');
          scope.setTag('lazy-route-key', error.routeKey);
          scope.setTag('lazy-route-path', window.location.pathname);
          scope.setTag('build-id', sentryConfig?.release ?? 'unknown');
          scope.setExtras({
            info,
            'lazy-route-module-path': error.modulePath,
            'lazy-route-module-exports': error.moduleExports,
            'lazy-route-chunk-url': getLastRequestedChunkUrl(),
          });
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
