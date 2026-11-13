import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FIND_SCOPED_RELATION_RECORDS_OPERATION_NAME } from '@/object-record/record-column-scope/constants/FindScopedRelationRecordsOperationName';
import { useCallback } from 'react';

export const useRefetchScopedRelationRecords = () => {
  const apolloCoreClient = useApolloCoreClient();

  const refetchScopedRelationRecords = useCallback(
    () =>
      apolloCoreClient.refetchQueries({
        include: [FIND_SCOPED_RELATION_RECORDS_OPERATION_NAME],
      }),
    [apolloCoreClient],
  );

  return { refetchScopedRelationRecords };
};
