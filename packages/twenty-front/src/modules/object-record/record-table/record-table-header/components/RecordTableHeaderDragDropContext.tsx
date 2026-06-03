import { useProcessTableColumnDrop } from '@/object-record/record-table/record-table-header/hooks/useProcessTableColumnDrop';
import { isRecordTableHeaderProcessingComponentState } from '@/object-record/record-table/record-table-header/states/isRecordTableHeaderProcessingComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { DragDropContext, type OnDragEndResponder } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const RecordTableHeaderDragDropContext = ({
  children,
}: React.PropsWithChildren) => {
  const store = useStore();

  const { processTableColumnDrop } = useProcessTableColumnDrop();

  const isRecordTableHeaderProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordTableHeaderProcessingComponentState,
    );

  const handleDragStart = useCallback(() => {
    store.set(isRecordTableHeaderProcessingCallbackState, true);
  }, [store, isRecordTableHeaderProcessingCallbackState]);

  const handleDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) {
        store.set(isRecordTableHeaderProcessingCallbackState, false);
        return;
      }

      try {
        processTableColumnDrop(result);
      } catch (error) {
        store.set(isRecordTableHeaderProcessingCallbackState, false);
        throw error;
      }
    },
    [processTableColumnDrop, store, isRecordTableHeaderProcessingCallbackState],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
