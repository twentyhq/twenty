import React, { useCallback, useEffect } from 'react';
import { useSnackBar } from 'twenty-ui';

import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';

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
            variant: 'error',
          },
        );
      } else {
        enqueueSnackBar(`Error: ${event.reason}`, {
          variant: 'error',
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
