import { useCallback } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useTableColumns } from '@/object-record/record-table/hooks/useTableColumns';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

export const useRecordIndexOptionsForTable = (recordTableId: string) => {
  const { hiddenTableColumnsSelector, visibleTableColumnsSelector } =
    useRecordTableStates(recordTableId);

  const hiddenTableColumns = useRecoilValue(hiddenTableColumnsSelector());
  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  const { handleColumnVisibilityChange, handleColumnReorder } = useTableColumns(
    { recordTableId: recordTableId },
  );

  const handleReorderColumns: OnDragEndResponder = useCallback(
    (result) => {
      if (
        !result.destination ||
        result.destination.index === 1 ||
        result.source.index === 1
      ) {
        return;
      }

      const reorderedFields = moveArrayItem(visibleTableColumns, {
        fromIndex: result.source.index - 1,
        toIndex: result.destination.index - 1,
      });

      handleColumnReorder(reorderedFields);
    },
    [visibleTableColumns, handleColumnReorder],
  );

  return {
    handleReorderColumns,
    handleColumnVisibilityChange,
    visibleTableColumns,
    hiddenTableColumns,
  };
};
