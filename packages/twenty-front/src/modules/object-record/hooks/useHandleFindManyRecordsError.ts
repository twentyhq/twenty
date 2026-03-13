import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { type ErrorLike } from '@apollo/client';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useCallback } from 'react';
import { logError } from '~/utils/logError';

export const useHandleFindManyRecordsError = ({
  handleError,
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
  handleError?: (error?: Error) => void;
}) => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const handleFindManyRecordsError = useCallback(
    (error: ErrorLike) => {
      logError(
        `useFindManyRecords for "${objectMetadataItem.namePlural}" error : ` +
          error,
      );
      if (CombinedGraphQLErrors.is(error)) {
        enqueueErrorSnackBar({
          apolloError: error,
        });
      } else {
        enqueueErrorSnackBar({});
      }
      handleError?.(error as Error);
    },
    [enqueueErrorSnackBar, handleError, objectMetadataItem.namePlural],
  );

  return {
    handleFindManyRecordsError,
  };
};
