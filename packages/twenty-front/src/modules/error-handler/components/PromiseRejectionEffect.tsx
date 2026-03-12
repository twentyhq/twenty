import { useCallback, useEffect } from 'react';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import isEmpty from 'lodash.isempty';
import { isDefined, type CustomError } from 'twenty-shared/utils';

const hasErrorCode = (
  error: CustomError | any,
): error is CustomError & { code: string } => {
  return 'code' in error && isDefined(error.code);
};

export const PromiseRejectionEffect = () => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const handlePromiseRejection = useCallback(
    async (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error.name === 'ApolloError' && !isEmpty(error.graphQLErrors)) {
        enqueueErrorSnackBar({
          apolloError: error,
        });
        return; // already handled by apolloLink
      }

      const isAbortError =
        error.networkError?.name === 'AbortError' ||
        error.name === 'AbortError';

      // Transient network errors (Failed to fetch, Load failed) from Apollo
      // are not actionable — typically caused by unstable connectivity or
      // browser tab backgrounding. Skip both the snackbar and Sentry.
      const isTransientNetworkError =
        error.name === 'ApolloError' &&
        isEmpty(error.graphQLErrors) &&
        error.networkError?.name === 'TypeError';

      if (!isAbortError && !isTransientNetworkError) {
        enqueueErrorSnackBar({});
      }

      if (isTransientNetworkError) {
        return;
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
