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
