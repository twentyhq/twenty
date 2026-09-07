import { useStore } from 'jotai';
import { type ReactNode } from 'react';

import { useProcessTableWithoutGroupRecordDrop } from '@/object-record/record-drag/hooks/useProcessTableWithoutGroupRecordDrop';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableBodyDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDragDropContextProvider';
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

  const { processTableWithoutGroupRecordDrop } =
    useProcessTableWithoutGroupRecordDrop();

  return (
    <RecordTableBodyDragDropContextProvider
      getDroppableItemCount={() =>
        store.get(totalNumberOfRecordsToVirtualize) ?? 0
      }
      onRecordDrop={processTableWithoutGroupRecordDrop}
      renderDragOverlay={(source) => (
        <RecordTableRowDragOverlayContent source={source} />
      )}
    >
      {children}
    </RecordTableBodyDragDropContextProvider>
  );
};
