import { useCallback, useEffect } from 'react';

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
import { isDefined, isNonEmptyString, type CustomError } from 'twenty-shared/utils';

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

      if (isAbortError) {
        return;
      }

      enqueueErrorSnackBar(
        error instanceof Error ? { message: error.message } : {},
      );

      try {
        const { captureException } = await import('@sentry/react');
        captureException(error, (scope) => {
          scope.setExtras({ mechanism: 'onUnhandledRejection' });

          const fingerprint = hasErrorCode(error)
            ? error.code
            : isNonEmptyString(error?.message)
              ? error.message
              : 'unknown-unhandled-rejection';

          scope.setFingerprint([fingerprint]);

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
