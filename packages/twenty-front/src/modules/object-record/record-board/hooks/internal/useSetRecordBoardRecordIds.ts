import { useRecoilCallback } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useSetRecordBoardRecordIds = (recordBoardId?: string) => {
  const {
    scopeId,
    recordBoardRecordIdsByColumnIdFamilyState,
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

          const columnRecordIds = records
            .filter((record) => record.stage === column?.value)
            .map((record) => record.id);
          set(
            recordBoardRecordIdsByColumnIdFamilyState(columnId),
            columnRecordIds,
          );
        });
      },
    [
      columnsFamilySelector,
      getColumnIdsState,
      recordBoardRecordIdsByColumnIdFamilyState,
    ],
  );

  return {
    scopeId,
    setRecordIds,
  };
};
