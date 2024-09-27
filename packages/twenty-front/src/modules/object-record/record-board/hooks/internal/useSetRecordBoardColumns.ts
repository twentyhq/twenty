import { useRecoilCallback } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

export const useSetRecordBoardColumns = (recordBoardId?: string) => {
  const { scopeId, columnIdsState, columnsFamilySelector } =
    useRecordBoardStates(recordBoardId);

  const setColumns = useRecoilCallback(
    ({ set, snapshot }) =>
      (columns: RecordGroupDefinition[]) => {
        const currentColumnsIds = snapshot
          .getLoadable(columnIdsState)
          .getValue();

        const columnIds = columns
          .filter(({ isVisible }) => isVisible)
          .map(({ id }) => id);

        if (isDeeplyEqual(currentColumnsIds, columnIds)) {
          return;
        }

        set(columnIdsState, columnIds);

        columns.forEach((column) => {
          const currentColumn = snapshot
            .getLoadable(columnsFamilySelector(column.id))
            .getValue();

          if (isDeeplyEqual(currentColumn, column)) {
            return;
          }

          set(columnsFamilySelector(column.id), column);
        });
      },
    [columnsFamilySelector, columnIdsState],
  );

  return {
    scopeId,
    setColumns,
  };
};
