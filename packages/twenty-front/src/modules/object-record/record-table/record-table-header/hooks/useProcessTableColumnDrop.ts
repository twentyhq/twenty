import { type DropResult } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useDebouncedCallback } from 'use-debounce';
import { isRecordTableHeaderProcessingComponentState } from '@/object-record/record-table/record-table-header/states/isRecordTableHeaderProcessingComponentState';
import { useReorderColumns } from '@/object-record/record-table/record-table-header/hooks/useReorderColumns';

export const useProcessTableColumnDrop = () => {
  const store = useStore();

  const { reorderColumns } = useReorderColumns();

  const isRecordTableHeaderProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordTableHeaderProcessingComponentState,
    );

  // TODO: this is necessary to avoid race conditions when dragging right after a previous drag (~200ms to 500ms)
  // A way to fix this would be to have a proper optimistic logic on drop that doesn't just resets the whole board with trigger initial query but updates everything without waiting for the request return
  // Which is the problem here because it kind of destroys the existing columns that have more records than page size, and dnd library has issues computing drag when the underlying data change.
  const debouncedUpdateDropProcessing = useDebouncedCallback(
    (isPending: boolean) => {
      store.set(isRecordTableHeaderProcessingCallbackState, isPending);
    },
    500,
  );

  const processTableColumnDrop = useCallback(
    (headerColumnDropResult: DropResult) => {
      const source = headerColumnDropResult.source;
      const destination = headerColumnDropResult.destination;

      if (!isDefined(source) || !isDefined(destination)) return;
      reorderColumns({ source, destination });

      debouncedUpdateDropProcessing(false);
    },
    [reorderColumns, debouncedUpdateDropProcessing],
  );

  return {
    processTableColumnDrop,
  };
};
