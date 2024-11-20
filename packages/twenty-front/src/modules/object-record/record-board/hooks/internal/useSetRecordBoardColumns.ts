import { useRecoilCallback } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { sortRecordGroupDefinitions } from '@/object-record/record-group/utils/sortRecordGroupDefinitions';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetRecordBoardColumns = (recordBoardId?: string) => {
  const { scopeId, columnIdsState, columnsFamilySelector } =
    useRecordBoardStates(recordBoardId);

  const recordGroupSort = useRecoilComponentValueV2(
    recordIndexRecordGroupSortComponentState,
    recordBoardId,
  );

  const setColumns = useRecoilCallback(
    ({ set, snapshot }) =>
      (columns: RecordGroupDefinition[]) => {
        const currentColumnsIds = snapshot
          .getLoadable(columnIdsState)
          .getValue();

        const sortedColumns = sortRecordGroupDefinitions(
          columns,
          recordGroupSort,
        );

        const columnIds = sortedColumns
          .filter(({ isVisible }) => isVisible)
          .map(({ id }) => id);

        if (!isDeeplyEqual(currentColumnsIds, columnIds)) {
          set(columnIdsState, columnIds);
        }

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
    [columnIdsState, recordGroupSort, columnsFamilySelector],
  );

  return {
    scopeId,
    setColumns,
  };
};
