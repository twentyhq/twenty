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
  error: CustomError | any,
): error is CustomError & { code: string } => {
  return (
    isDefined(error) &&
    typeof error === 'object' &&
    'code' in error &&
    isDefined(error.code)
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
        const { captureException, captureMessage, withScope } = await import(
          '@sentry/react'
        );

        if (error instanceof ObjectMetadataItemNotFoundError) {
          withScope((scope) => {
            scope.setLevel('warning');
            scope.setFingerprint(['object-metadata-item-not-found']);
            scope.setTag('error-handler', 'promise-rejection');
            scope.setTag('error.category', 'metadata');
            scope.setTag('error.type', 'object-metadata-item-not-found');
            scope.setTag('object-name', error.objectNameSingular);
            scope.setTag(
              'metadata-store-status',
              error.metadataStoreStatus ?? 'unknown',
            );
            scope.setTag(
              'metadata-refresh-pending',
              String(error.isMetadataRefreshPending),
            );
            scope.setExtras({
              mechanism: 'onUnhandledRejection',
              pathname: window.location.pathname,
              objectMetadataItemCount: error.objectMetadataItemCount,
              currentCollectionHash: error.currentCollectionHash,
              draftCollectionHash: error.draftCollectionHash,
            });
            captureMessage(error.message);
          });

          return;
        }

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
