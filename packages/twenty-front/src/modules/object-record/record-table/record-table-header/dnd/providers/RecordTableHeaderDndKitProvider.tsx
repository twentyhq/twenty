import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { type RecordTableHeaderDndData } from '@/object-record/record-table/record-table-header/dnd/types/RecordTableHeaderDndData';
import { RecordTableHeaderDndContext } from '@/object-record/record-table/record-table-header/dnd/context/RecordTableHeaderDndContext';
import { useRecordTableHeaderDndKit } from '@/object-record/record-table/record-table-header/dnd/hooks/useRecordTableHeaderDndKit';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';

type RecordTableHeaderDndKitProviderProps = {
  children: ReactNode;
};

export const RecordTableHeaderDndKitProvider = ({
  children,
}: RecordTableHeaderDndKitProviderProps) => {
  const { contextValues, handlers } = useRecordTableHeaderDndKit();

  return (
    <RecordTableHeaderDndContext.Provider value={contextValues}>
      <DragDropProvider<RecordTableHeaderDndData>
        sensors={DND_KIT_SENSORS}
        onDragStart={handlers.onDragStart}
        onDragMove={handlers.onDragMove}
        onDragEnd={handlers.onDragEnd}
      >
        {children}
      </DragDropProvider>
    </RecordTableHeaderDndContext.Provider>
  );
};
