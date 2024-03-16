import { useRecoilCallback } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetRecordBoardRecordIds = (recordBoardId?: string) => {
  const {
    scopeId,
    recordIdsByColumnIdFamilyState,
    columnsFamilySelector,
    getColumnIdsState,
  } = useRecordBoardStates(recordBoardId);

  const setRecordIds = useRecoilCallback(
    ({ set, snapshot }) =>
      (records: ObjectRecord[]) => {
        const columnIds = snapshot.getLoadable(getColumnIdsState()).getValue();

        columnIds.forEach((columnId) => {
          const column = snapshot
            .getLoadable(columnsFamilySelector(columnId))
            .getValue();

          const existingColumnRecordIds = snapshot
            .getLoadable(recordIdsByColumnIdFamilyState(columnId))
            .getValue();

          const columnRecordIds = records
            .filter((record) => record.stage === column?.value)
            .sort(sortRecordsByPosition)
            .map((record) => record.id);

          if (!isDeeplyEqual(existingColumnRecordIds, columnRecordIds)) {
            set(recordIdsByColumnIdFamilyState(columnId), columnRecordIds);
          }
        });
      },
    [columnsFamilySelector, getColumnIdsState, recordIdsByColumnIdFamilyState],
  );

  return {
    scopeId,
    setRecordIds,
  };
};

const sortRecordsByPosition = (
  record1: ObjectRecord,
  record2: ObjectRecord,
) => {
  if (
    typeof record1.position == 'number' &&
    typeof record2.position == 'number'
  ) {
    return record1.position - record2.position;
  } else if (record1.position === 'first' || record2.position === 'last') {
    return -1;
  } else if (record2.position === 'first' || record1.position === 'last') {
    return 1;
  } else {
    return 0;
  }
};
