import { useCallback, useEffect } from 'react';

import { checkIfItsAViteStaleChunkLazyLoadingError } from '@/error-handler/utils/checkIfItsAViteStaleChunkLazyLoadingError';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LinkError,
  LocalStateError,
  ServerError,
  ServerParseError,
  UnconventionalError,
} from '@apollo/client/errors';
import { isNonEmptyString, isObject } from '@sniptt/guards';
import { isDefined, type CustomError } from 'twenty-shared/utils';

const STALE_CHUNK_LAZY_LOADING_FINGERPRINT = 'vite-stale-chunk-lazy-loading';

const isApolloError = (error: unknown): boolean =>
  CombinedGraphQLErrors.is(error) ||
  CombinedProtocolErrors.is(error) ||
  LinkError.is(error) ||
  LocalStateError.is(error) ||
  ServerError.is(error) ||
  ServerParseError.is(error) ||
  UnconventionalError.is(error);

const hasErrorCode = (
  error: CustomError | any,
): error is CustomError & { code: string } => {
  return isObject(error) && 'code' in error && isDefined(error.code);
};

// stale chunk messages embed the content-hashed asset URL, so fingerprinting on
// them would create a new Sentry issue for every deploy and every chunk
const getPromiseRejectionFingerprint = (
  error: unknown,
  isStaleChunkLazyLoadingError: boolean,
) => {
  if (isStaleChunkLazyLoadingError) {
    return STALE_CHUNK_LAZY_LOADING_FINGERPRINT;
  }

  if (hasErrorCode(error)) {
    return error.code;
  }

  return error instanceof Error ? error.message : undefined;
};

export const PromiseRejectionEffect = () => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const handlePromiseRejection = useCallback(
    async (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (isApolloError(error)) {
        enqueueErrorSnackBar({
          apolloError: error,
        });
        return; // already handled by apolloLink
      }

      const isAbortError =
        error?.networkError?.name === 'AbortError' ||
        error?.name === 'AbortError';

      const isStaleChunkLazyLoadingError =
        error instanceof Error &&
        checkIfItsAViteStaleChunkLazyLoadingError(error);

      if (!isAbortError && !isStaleChunkLazyLoadingError) {
        enqueueErrorSnackBar(
          error instanceof Error ? { message: error.message } : {},
        );
      }

      try {
        const { captureException } = await import('@sentry/react');
        captureException(error, (scope) => {
          scope.setExtras({ mechanism: 'onUnhandle' });
          scope.setTag(
            'errorSink',
            isStaleChunkLazyLoadingError
              ? 'promiseRejectionStaleChunk'
              : 'promiseRejection',
          );

          const fingerprint = getPromiseRejectionFingerprint(
            error,
            isStaleChunkLazyLoadingError,
          );

          if (isNonEmptyString(fingerprint)) {
            scope.setFingerprint([fingerprint]);
          }

          if (error instanceof Error) {
            error.name = error.message;
          }

          return scope;
        });
      } catch (sentryError) {
        // oxlint-disable-next-line no-console
        console.error('Failed to capture exception with Sentry:', sentryError);
      }
    },
    [enqueueErrorSnackBar],
  );

  useEffect(() => {
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [handlePromiseRejection]);

  return <></>;
};
