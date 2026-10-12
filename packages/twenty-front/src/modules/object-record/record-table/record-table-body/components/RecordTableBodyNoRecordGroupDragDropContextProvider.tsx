import { useStore } from 'jotai';
import { type ReactNode } from 'react';

import { RecordDragDropContextProvider } from '@/object-record/record-drag/components/RecordDragDropContextProvider';
import { useProcessRecordWithoutGroupDrop } from '@/object-record/record-drag/hooks/useProcessRecordWithoutGroupDrop';
import { useTriggerTableWithoutGroupDragAndDropOptimisticUpdate } from '@/object-record/record-drag/hooks/useTriggerTableWithoutGroupDragAndDropOptimisticUpdate';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowDragOverlayContent } from '@/object-record/record-table/record-table-row/components/RecordTableRowDragOverlayContent';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

type RecordTableBodyNoRecordGroupDragDropContextProviderProps = {
  children: ReactNode;
};

export const RecordTableBodyNoRecordGroupDragDropContextProvider = ({
  children,
}: RecordTableBodyNoRecordGroupDragDropContextProviderProps) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const totalNumberOfRecordsToVirtualize = useAtomComponentStateCallbackState(
    totalNumberOfRecordsToVirtualizeComponentState,
    recordTableId,
  );

  const store = useStore();

  const { triggerTableWithoutGroupDragAndDropOptimisticUpdate } =
    useTriggerTableWithoutGroupDragAndDropOptimisticUpdate();

  const { processRecordWithoutGroupDrop } = useProcessRecordWithoutGroupDrop({
    onBeforeRecordsUpdate: triggerTableWithoutGroupDragAndDropOptimisticUpdate,
  });

  return (
    <RecordDragDropContextProvider
      getDroppableItemCount={() =>
        store.get(totalNumberOfRecordsToVirtualize) ?? 0
      }
      onRecordDrop={processRecordWithoutGroupDrop}
      renderDragOverlay={(source) => (
        <RecordTableRowDragOverlayContent source={source} />
      )}
    >
      {children}
    </RecordDragDropContextProvider>
  );
};
