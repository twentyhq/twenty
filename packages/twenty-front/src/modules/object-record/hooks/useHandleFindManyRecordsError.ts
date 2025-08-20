import { type ApolloError } from '@apollo/client';

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
    (error: ApolloError) => {
      logError(
        `useFindManyRecords for "${objectMetadataItem.namePlural}" error : ` +
          error,
      );
      enqueueErrorSnackBar({
        apolloError: error,
      });
      handleError?.(error);
    },
    [enqueueErrorSnackBar, handleError, objectMetadataItem.namePlural],
  );

  return {
    handleFindManyRecordsError,
  };
};
