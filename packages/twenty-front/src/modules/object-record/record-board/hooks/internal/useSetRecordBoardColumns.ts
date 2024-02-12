import { useRecoilCallback } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetRecordBoardColumns = (recordBoardId?: string) => {
  const { scopeId, getColumnIdsState, columnsFamilySelector } =
    useRecordBoardStates(recordBoardId);

  const setColumns = useRecoilCallback(
    ({ set, snapshot }) =>
      (columns: RecordBoardColumnDefinition[]) => {
        const currentColumnsIds = snapshot
          .getLoadable(getColumnIdsState())
          .getValue();

        const columnIds = columns.map(({ id }) => id);

        if (isDeeplyEqual(currentColumnsIds, columnIds)) {
          return;
        }

        set(
          getColumnIdsState(),
          columns.map((column) => column.id),
        );

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
    [columnsFamilySelector, getColumnIdsState],
  );

  return {
    scopeId,
    setColumns,
  };
};
