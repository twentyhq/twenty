import { useCallback, useEffect } from 'react';

import { CustomError } from '@/error-handler/CustomError';
import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import isEmpty from 'lodash.isempty';
import { isDefined } from 'twenty-shared/utils';

const hasErrorCode = (
  error: CustomError | any,
): error is CustomError & { code: string } => {
  return 'code' in error && isDefined(error.code);
};

export const PromiseRejectionEffect = () => {
  const { enqueueSnackBar } = useSnackBar();

  const handlePromiseRejection = useCallback(
    async (event: PromiseRejectionEvent) => {
      const error = event.reason;

      if (error instanceof ObjectMetadataItemNotFoundError) {
        enqueueSnackBar(
          `Error with custom object that cannot be found : ${event.reason}`,
          {
            variant: SnackBarVariant.Error,
          },
        );
      } else {
        enqueueSnackBar(`${error.message}`, {
          variant: SnackBarVariant.Error,
        });
      }

      if (error.name === 'ApolloError' && !isEmpty(error.graphQLErrors)) {
        return; // already handled by apolloLink
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
        // eslint-disable-next-line no-console
        console.error('Failed to capture exception with Sentry:', sentryError);
      }
    },
    [enqueueSnackBar],
  );

  useEffect(() => {
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [handlePromiseRejection]);

  return <></>;
};
