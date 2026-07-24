import { useCallback, useEffect } from 'react';

import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
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
    isDefined(error.code)
  );
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
          scope.setTag('error-handler', 'promise-rejection');

          const fingerprint = hasErrorCode(error)
            ? error.code
            : error instanceof Error
              ? error.message
              : 'non-error-promise-rejection';

          scope.setFingerprint([fingerprint]);

          if (error instanceof ObjectMetadataItemNotFoundError) {
            scope.setFingerprint(['object-metadata-item-not-found']);
            scope.setLevel('warning');
            scope.setTag('error.category', 'metadata');
            scope.setTag('error.type', 'object-metadata-item-not-found');
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
