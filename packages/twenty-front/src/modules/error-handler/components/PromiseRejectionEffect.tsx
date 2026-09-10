import { t } from '@lingui/core/macro';
import { useCallback, useEffect } from 'react';

import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { checkIfItsAViteStaleChunkLazyLoadingError } from '@/error-handler/utils/checkIfItsAViteStaleChunkLazyLoadingError';
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LinkError,
  LocalStateError,
  ServerError,
  ServerParseError,
  UnconventionalError,
} from '@apollo/client/errors';
import { isDefined, type CustomError } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';

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
  return 'code' in error && isDefined(error.code);
};

export const PromiseRejectionEffect = () => {
  const { enqueueErrorToast } = useErrorToast();
  const { enqueueToast } = useToast();

  const handlePromiseRejection = useCallback(
    async (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (isApolloError(error)) {
        enqueueErrorToast(error);
        return; // already handled by apolloLink
      }

      const isAbortError =
        error?.networkError?.name === 'AbortError' ||
        error?.name === 'AbortError';

      const isViteStaleChunkLazyLoadingError =
        error instanceof Error &&
        checkIfItsAViteStaleChunkLazyLoadingError(error);

      if (!isAbortError && !isViteStaleChunkLazyLoadingError) {
        if (error instanceof Error) {
          enqueueToast({ variant: 'error', children: error.message });
        } else {
          enqueueToast({ variant: 'error', children: t`An error occurred.` });
        }
      }

      try {
        const { captureException } = await import('@sentry/react');
        captureException(error, (scope) => {
          scope.setExtras({ mechanism: 'onUnhandle' });

          const fingerprint = hasErrorCode(error) ? error.code : error.message;
          scope.setFingerprint([fingerprint]);
          error.name = error.message;
          return scope;
        });
      } catch (sentryError) {
        // oxlint-disable-next-line no-console
        console.error('Failed to capture exception with Sentry:', sentryError);
      }
    },
    [enqueueErrorToast, enqueueToast],
  );

  useEffect(() => {
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [handlePromiseRejection]);

  return <></>;
};
