import { useStore } from 'jotai';
import { type ReactNode } from 'react';

import { RecordDragDropContextProvider } from '@/object-record/record-drag/components/RecordDragDropContextProvider';
import { useProcessRecordGroupDrop } from '@/object-record/record-drag/hooks/useProcessRecordGroupDrop';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordTableRecordGroupBodyContextProvider } from '@/object-record/record-table/components/RecordTableRecordGroupBodyContextProvider';
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

  const { processRecordGroupDrop } = useProcessRecordGroupDrop();

  return (
    <RecordDragDropContextProvider
      getDroppableItemCount={(droppableId) =>
        store.get(recordIdsByGroupCallbackState(droppableId)).length
      }
      onRecordDrop={processRecordGroupDrop}
      renderDragOverlay={(source) => (
        <RecordTableRecordGroupBodyContextProvider>
          <RecordTableRowDragOverlayContent source={source} />
        </RecordTableRecordGroupBodyContextProvider>
      )}
    >
      {children}
    </RecordDragDropContextProvider>
  );
};
