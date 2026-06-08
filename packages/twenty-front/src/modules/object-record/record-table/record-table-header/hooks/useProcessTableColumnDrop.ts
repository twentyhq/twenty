import { type DropResult } from '@hello-pangea/dnd';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useReorderColumns } from '@/object-record/record-table/record-table-header/hooks/useReorderColumns';
import { useResetRecordTableHeaderDragStates } from '@/object-record/record-table/record-table-header/hooks/useResetRecordTableHeaderDragState';

export const useProcessTableColumnDrop = () => {
  const { reorderColumns } = useReorderColumns();

  const { resetRecordTableHeaderDragStates } =
    useResetRecordTableHeaderDragStates();

  const processTableColumnDrop = useCallback(
    async (headerColumnDropResult: DropResult) => {
      const source = headerColumnDropResult.source;
      const destination = headerColumnDropResult.destination;

      if (!isDefined(source) || !isDefined(destination)) return;

      try {
        await reorderColumns({ source, destination });
      } finally {
        resetRecordTableHeaderDragStates();
      }
    },
    [reorderColumns, resetRecordTableHeaderDragStates],
  );

  return {
    processTableColumnDrop,
  };
};
