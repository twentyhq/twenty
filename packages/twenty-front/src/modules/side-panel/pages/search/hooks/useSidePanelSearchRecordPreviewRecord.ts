import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Field displays read from the record store, so the previewed record has to be
// hydrated there before its values can render
export const useSidePanelSearchRecordPreviewRecord = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: string;
  recordId: string;
}) => {
  const store = useStore();

  const { record, loading } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: recordId,
  });

  useEffect(() => {
    if (loading || !isDefined(record)) {
      return;
    }

    store.set(
      recordStoreFamilyState.atomFamily(recordId),
      record as ObjectRecord,
    );
  }, [record, loading, recordId, store]);
};
