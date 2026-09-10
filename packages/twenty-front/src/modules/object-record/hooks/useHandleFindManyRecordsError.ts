import { type ErrorLike } from '@apollo/client';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCallback } from 'react';

import { useToast } from 'twenty-ui/feedback';
import { logError } from '~/utils/logError';

export const useHandleFindManyRecordsError = ({
  handleError,
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  handleError?: (error?: Error) => void;
}) => {
  const { enqueueToast } = useToast();

  const handleFindManyRecordsError = useCallback(
    (error: ErrorLike) => {
      logError(
        `useFindManyRecords for "${objectMetadataItem.namePlural}" error : ` +
          error,
      );
      enqueueToast(getToastOptionsFromError({ error }));
      handleError?.(error as Error);
    },
    [enqueueToast, handleError, objectMetadataItem.namePlural],
  );

  return {
    handleFindManyRecordsError,
  };
};
