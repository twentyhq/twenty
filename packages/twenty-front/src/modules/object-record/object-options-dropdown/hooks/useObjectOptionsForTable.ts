import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useCallback } from 'react';

import { useTableColumns } from '@/object-record/record-table/hooks/useTableColumns';
import { hiddenTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/hiddenTableColumnsComponentSelector';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

export const useObjectOptionsForTable = (
  recordTableId: string,
  objectMetadataId: string,
) => {
  const hiddenTableColumns = useRecoilComponentValue(
    hiddenTableColumnsComponentSelector,
    recordTableId,
  );
  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
    recordTableId,
  );

  const { handleColumnVisibilityChange, handleColumnReorder } = useTableColumns(
    { recordTableId, objectMetadataId },
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
