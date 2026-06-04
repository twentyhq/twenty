import { type DropResult } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { isRecordTableHeaderDropProcessingComponentState } from '@/object-record/record-table/record-table-header/states/isRecordTableHeaderDropProcessingComponentState';
import { useReorderColumns } from '@/object-record/record-table/record-table-header/hooks/useReorderColumns';

export const useProcessTableColumnDrop = () => {
  const store = useStore();

  const { reorderColumns } = useReorderColumns();

  const isRecordTableHeaderDropProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordTableHeaderDropProcessingComponentState,
    );

  const processTableColumnDrop = useCallback(
    (headerColumnDropResult: DropResult) => {
      const source = headerColumnDropResult.source;
      const destination = headerColumnDropResult.destination;

      if (!isDefined(source) || !isDefined(destination)) return;
      reorderColumns({ source, destination });

      store.set(isRecordTableHeaderDropProcessingCallbackState, false);
    },
    [reorderColumns, store, isRecordTableHeaderDropProcessingCallbackState],
  );

  return {
    processTableColumnDrop,
  };
};
