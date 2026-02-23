import type { Store } from 'jotai/vanilla/store';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';

export const extractRecordPositions = (
  recordIds: string[],
  store: Store,
): RecordWithPosition[] => {
  return recordIds.map((recordId) => {
    const record = store.get(recordStoreFamilyState.atomFamily(recordId)) as
      | { position?: number }
      | null
      | undefined;

    return {
      id: recordId,
      position: record?.position ?? 0,
    };
  });
};
