import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import type { useStore } from 'jotai';

export const unselectRecord = (
  store: ReturnType<typeof useStore>,
  recordId: string,
  recordIndexId: string,
) => {
  store.set(
    isRowSelectedComponentFamilyState.atomFamily({
      instanceId: recordIndexId,
      familyKey: recordId,
    }),
    false,
  );

  store.set(
    isRecordBoardCardSelectedComponentFamilyState.atomFamily({
      instanceId: recordIndexId,
      familyKey: recordId,
    }),
    false,
  );
};
