import { useCallback, useEffect } from 'react';

import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import isEmpty from 'lodash.isempty';

export const PromiseRejectionEffect = () => {
  const { enqueueSnackBar } = useSnackBar();

  const handlePromiseRejection = useCallback(
    (event: PromiseRejectionEvent) => {
      const error = event.reason;

      // TODO: connect Sentry here
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

      if (error instanceof ApolloError && !isEmpty(error.graphQLErrors)) {
        event.preventDefault(); // do not send to sentry because already handled
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
