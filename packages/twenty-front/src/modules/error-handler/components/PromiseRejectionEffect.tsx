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
import { isDefined, type CustomError } from 'twenty-shared/utils';

const isApolloError = (error: unknown): boolean =>
  CombinedGraphQLErrors.is(error) ||
  CombinedProtocolErrors.is(error) ||
  LinkError.is(error) ||
  LocalStateError.is(error) ||
  ServerError.is(error) ||
  ServerParseError.is(error) ||
  UnconventionalError.is(error);

const hasErrorCode = (
  error: unknown,
): error is CustomError & { code: string } => {
  return (
    isDefined(error) &&
    typeof error === 'object' &&
    'code' in error &&
    typeof error.code === 'string'
  );
};

const nonCriticalErrorCodes = new Set([
  'INVALID_DATE_TIME_FILTER_VALUE',
  'FILE_UPLOAD_OPERATION_FAILED',
]);

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
          scope.setTag('error-handler', 'promise-rejection');

          const fingerprint = hasErrorCode(error)
            ? error.code
            : error instanceof Error
              ? error.message
              : 'non-error-promise-rejection';

          scope.setFingerprint([fingerprint]);

          if (hasErrorCode(error) && nonCriticalErrorCodes.has(error.code)) {
            scope.setLevel('warning');
            scope.setTag(
              'error-expectedness',
              error.code === 'FILE_UPLOAD_OPERATION_FAILED'
                ? 'expected-file-upload-operation-failure'
                : 'expected-invalid-filter-value',
            );
          } else if (!(error instanceof Error)) {
            scope.setLevel('warning');
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
