import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { useRecordTableHeaderDndKit } from '@/object-record/record-table/record-table-header/dnd/hooks/useRecordTableHeaderDndKit';
import { DragDropColumnDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropColumnDndContext';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { type DragDropColumnData } from '@/ui/utilities/drag-and-drop/types/DragDropColumnData';

type RecordTableHeaderDndKitProviderProps = {
  children: ReactNode;
};

export const RecordTableHeaderDndKitProvider = ({
  children,
}: RecordTableHeaderDndKitProviderProps) => {
  const { contextValues, handlers } = useRecordTableHeaderDndKit();

  return (
    <DragDropColumnDndContext.Provider value={contextValues}>
      <DragDropProvider<DragDropColumnData>
        sensors={DND_KIT_SENSORS}
        onDragStart={handlers.onDragStart}
        onDragMove={handlers.onDragMove}
        onDragEnd={handlers.onDragEnd}
      >
        {children}
      </DragDropProvider>
    </DragDropColumnDndContext.Provider>
  );
};
