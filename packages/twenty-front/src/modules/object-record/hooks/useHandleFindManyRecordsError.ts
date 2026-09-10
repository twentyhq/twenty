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
  const { addErrorToast } = useErrorToast();

  const handleFindManyRecordsError = useCallback(
    (error: ErrorLike) => {
      logError(
        `useFindManyRecords for "${objectMetadataItem.namePlural}" error : ` +
          error,
      );
      addErrorToast(error);
      handleError?.(error as Error);
    },
    [addErrorToast, handleError, objectMetadataItem.namePlural],
  );

  return {
    handleFindManyRecordsError,
  };
};
