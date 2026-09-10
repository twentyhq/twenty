import { type ErrorLike } from '@apollo/client';

import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCallback } from 'react';

import { logError } from '~/utils/logError';

export const useHandleFindManyRecordsError = ({
  handleError,
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  handleError?: (error?: Error) => void;
}) => {
  const { enqueueErrorToast } = useErrorToast();

  const handleFindManyRecordsError = useCallback(
    (error: ErrorLike) => {
      logError(
        `useFindManyRecords for "${objectMetadataItem.namePlural}" error : ` +
          error,
      );
      enqueueErrorToast(error);
      handleError?.(error as Error);
    },
    [enqueueErrorToast, handleError, objectMetadataItem.namePlural],
  );

  return {
    handleFindManyRecordsError,
  };
};
