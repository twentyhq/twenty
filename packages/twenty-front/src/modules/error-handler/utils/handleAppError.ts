import type * as SentryReact from '@sentry/react';

import { checkIfItsAViteStaleChunkLazyLoadingError } from '@/error-handler/utils/checkIfItsAViteStaleChunkLazyLoadingError';
import { isStaleChunkReloadCooldownActive } from '@/error-handler/utils/isStaleChunkReloadCooldownActive';
import { storeStaleChunkReloadTimestamp } from '@/error-handler/utils/storeStaleChunkReloadTimestamp';
import { type ErrorInfo } from 'react';
import { type CustomError, isDefined } from 'twenty-shared/utils';
import { reloadWindow } from '~/utils/reloadWindow';

const SENTRY_IMPORT_TIMEOUT_BEFORE_RELOAD_MS = 2_000;
const SENTRY_FLUSH_TIMEOUT_BEFORE_RELOAD_MS = 2_000;

const hasErrorCode = (
  error: Error | CustomError,
): error is CustomError & { code: string } => {
  return 'code' in error && isDefined(error.code);
};

const captureAppError = ({
  sentryImportPromise,
  error,
  errorInfo,
}: {
  sentryImportPromise: Promise<typeof SentryReact>;
  error: Error | CustomError;
  errorInfo?: ErrorInfo;
}) =>
  sentryImportPromise
    .then(({ captureException, flush }) => {
      captureException(error, (scope) => {
        scope.setExtras({ info: errorInfo });

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

export const handleAppError = ({
  error,
  errorInfo,
}: {
  error: Error | CustomError;
  errorInfo?: ErrorInfo;
}) => {
  const sentryImportPromise = import('@sentry/react');
  const captureAppErrorPromise = captureAppError({
    sentryImportPromise,
    error,
    errorInfo,
  });

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
      setTimeout(() => resolve(false), SENTRY_IMPORT_TIMEOUT_BEFORE_RELOAD_MS),
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
