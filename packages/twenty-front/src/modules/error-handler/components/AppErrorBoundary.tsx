import type * as SentryReact from '@sentry/react';

import { AppErrorBoundaryEffect } from '@/error-handler/components/internal/AppErrorBoundaryEffect';
import { checkIfItsAViteStaleChunkLazyLoadingError } from '@/error-handler/utils/checkIfItsAViteStaleChunkLazyLoadingError';
import { isStaleChunkReloadCooldownActive } from '@/error-handler/utils/isStaleChunkReloadCooldownActive';
import { storeStaleChunkReloadTimestamp } from '@/error-handler/utils/storeStaleChunkReloadTimestamp';
import { type ErrorInfo, type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { type CustomError, isDefined } from 'twenty-shared/utils';
import { reloadWindow } from '~/utils/reloadWindow';

const SENTRY_IMPORT_TIMEOUT_BEFORE_RELOAD_MS = 2_000;
const SENTRY_FLUSH_TIMEOUT_BEFORE_RELOAD_MS = 2_000;

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

const captureAppError = (
  sentryImportPromise: Promise<typeof SentryReact>,
  error: Error | CustomError,
  info: ErrorInfo,
) =>
  sentryImportPromise
    .then(({ captureException, flush }) => {
      captureException(error, (scope) => {
        scope.setExtras({ info });

        const fingerprint = hasErrorCode(error) ? error.code : error.message;
        scope.setFingerprint([fingerprint]);
        error.name = error.message;
        return scope;
      });

      return flush(SENTRY_FLUSH_TIMEOUT_BEFORE_RELOAD_MS);
    })
    .catch((sentryError) => {
      // oxlint-disable-next-line no-console
      console.error('Failed to capture exception with Sentry:', sentryError);
    });

export const AppErrorBoundary = ({
  children,
  FallbackComponent,
  resetOnLocationChange = true,
}: AppErrorBoundaryProps) => {
  const handleError = (error: Error | CustomError, info: ErrorInfo) => {
    const sentryImportPromise = import('@sentry/react');
    const captureAppErrorPromise = captureAppError(
      sentryImportPromise,
      error,
      info,
    );

    const isViteStaleChunkLazyLoadingError =
      checkIfItsAViteStaleChunkLazyLoadingError(error);

    const shouldAttemptStaleChunkReload =
      isViteStaleChunkLazyLoadingError && !isStaleChunkReloadCooldownActive();

    if (!shouldAttemptStaleChunkReload) {
      return;
    }

    const isReloadTimestampStored = storeStaleChunkReloadTimestamp();

    if (!isReloadTimestampStored) {
      return;
    }

    const reloadAfterSentryCapture = async () => {
      const sentryImportTimeoutPromise = new Promise<boolean>((resolve) =>
        setTimeout(
          () => resolve(false),
          SENTRY_IMPORT_TIMEOUT_BEFORE_RELOAD_MS,
        ),
      );

      const isSentryImportSettled = await Promise.race([
        sentryImportPromise.then(
          () => true,
          () => true,
        ),
        sentryImportTimeoutPromise,
      ]);

      if (isSentryImportSettled) {
        const sentryFlushTimeoutPromise = new Promise<void>((resolve) =>
          setTimeout(resolve, SENTRY_FLUSH_TIMEOUT_BEFORE_RELOAD_MS),
        );

        await Promise.race([captureAppErrorPromise, sentryFlushTimeoutPromise]);
      }

      reloadWindow();
    };

    void reloadAfterSentryCapture();
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
