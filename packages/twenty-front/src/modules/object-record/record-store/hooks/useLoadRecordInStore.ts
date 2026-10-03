import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

// field displays read the record store, so the loaded record is written there
export const useLoadRecordInStore = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: string;
  recordId: string | undefined;
}) => {
  const { record, loading, error } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: recordId,
  });
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    if (isDefined(record)) {
      upsertRecordsInStore({ partialRecords: [record] });
    }
  }, [record, upsertRecordsInStore]);

  return { record, loading, error };
};
