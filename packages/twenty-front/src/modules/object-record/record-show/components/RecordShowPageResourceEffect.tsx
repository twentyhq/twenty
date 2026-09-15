import { useEffect } from 'react';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const RecordShowPageResourceEffect = ({
  loading,
  record,
  recordId,
}: {
  loading: boolean;
  record: ObjectRecord | undefined;
  recordId: string;
}) => {
  const store = useStore();

  useEffect(() => {
    if (loading) {
      return;
    }

    const recordAtom = recordStoreFamilyState.atomFamily(recordId);
    const previousRecord = store.get(recordAtom);

    if (!isDefined(record)) {
      if (isDefined(previousRecord)) {
        store.set(recordAtom, null);
      }
      return;
    }

    if (!isDeeplyEqual(previousRecord, record)) {
      store.set(recordAtom, record);
    }
  }, [loading, record, recordId, store]);

  return null;
};
