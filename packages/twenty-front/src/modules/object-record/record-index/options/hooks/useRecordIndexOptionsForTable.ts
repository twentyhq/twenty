import { useCallback } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useTableColumns } from '@/object-record/record-table/hooks/useTableColumns';

export const useRecordIndexOptionsForTable = (recordTableId: string) => {
  const { getHiddenTableColumnsSelector, getVisibleTableColumnsSelector } =
    useRecordTableStates(recordTableId);

  const hiddenTableColumns = useRecoilValue(getHiddenTableColumnsSelector());
  const visibleTableColumns = useRecoilValue(getVisibleTableColumnsSelector());

  const { handleColumnVisibilityChange, handleColumnReorder } = useTableColumns(
    { recordTableId: recordTableId },
  );

  const handleReorderField: OnDragEndResponder = useCallback(
    (result) => {
      if (
        !result.destination ||
        result.destination.index === 1 ||
        result.source.index === 1
      ) {
        return;
      }

      const reorderFields = [...visibleTableColumns];
      const [removed] = reorderFields.splice(result.source.index - 1, 1);
      reorderFields.splice(result.destination.index - 1, 0, removed);

      handleColumnReorder(reorderFields);
    },
    [visibleTableColumns, handleColumnReorder],
  );

  return {
    handleReorderField,
    handleColumnVisibilityChange,
    visibleTableColumns,
    hiddenTableColumns,
  };
};
