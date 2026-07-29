import { useCallback } from 'react';

import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

type UseRefetchRelationFieldRecordParams = {
  recordId: string;
  objectMetadataId: string;
};

export const useRefetchRelationFieldRecord = ({
  recordId,
  objectMetadataId,
}: UseRefetchRelationFieldRecordParams) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const { findOneRecord } = useLazyFindOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    fetchPolicy: 'network-only',
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const refetchRelationFieldRecord = useCallback(async () => {
    await findOneRecord({
      objectRecordId: recordId,
      onCompleted: (record) => {
        upsertRecordsInStore({ partialRecords: [record] });
      },
    });
  }, [findOneRecord, recordId, upsertRecordsInStore]);

  return { refetchRelationFieldRecord };
};
