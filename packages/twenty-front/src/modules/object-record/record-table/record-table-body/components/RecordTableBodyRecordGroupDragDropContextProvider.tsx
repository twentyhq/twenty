import { useStore } from 'jotai';
import { type ReactNode } from 'react';

import { useProcessTableWithGroupRecordDrop } from '@/object-record/record-drag/hooks/useProcessTableWithGroupRecordDrop';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordTableRecordGroupBodyContextProvider } from '@/object-record/record-table/components/RecordTableRecordGroupBodyContextProvider';
import { RecordTableBodyDragDropContextProvider } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDragDropContextProvider';
import { RecordTableRowDragOverlayContent } from '@/object-record/record-table/record-table-row/components/RecordTableRowDragOverlayContent';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';

type RecordTableBodyRecordGroupDragDropContextProviderProps = {
  children: ReactNode;
};

export const RecordTableBodyRecordGroupDragDropContextProvider = ({
  children,
}: RecordTableBodyRecordGroupDragDropContextProviderProps) => {
  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const store = useStore();

  const { processTableWithGroupRecordDrop } =
    useProcessTableWithGroupRecordDrop();

  return (
    <RecordTableBodyDragDropContextProvider
      getDroppableItemCount={(droppableId) =>
        store.get(recordIdsByGroupCallbackState(droppableId)).length
      }
      onRecordDrop={processTableWithGroupRecordDrop}
      renderDragOverlay={(source) => (
        <RecordTableRecordGroupBodyContextProvider>
          <RecordTableRowDragOverlayContent source={source} />
        </RecordTableRecordGroupBodyContextProvider>
      )}
    >
      {children}
    </RecordTableBodyDragDropContextProvider>
  );
};
