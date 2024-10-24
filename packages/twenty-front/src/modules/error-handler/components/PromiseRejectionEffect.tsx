import { useCallback, useEffect } from 'react';

import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

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
