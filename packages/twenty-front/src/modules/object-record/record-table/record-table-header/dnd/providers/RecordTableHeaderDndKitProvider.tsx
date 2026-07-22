import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { useRecordTableHeaderDndKit } from '@/object-record/record-table/record-table-header/dnd/hooks/useRecordTableHeaderDndKit';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';

type RecordTableHeaderDndKitProviderProps = {
  children: ReactNode;
};

export const RecordTableHeaderDndKitProvider = ({
  children,
}: RecordTableHeaderDndKitProviderProps) => {
  const { contextValues, handlers } = useRecordTableHeaderDndKit();

  return (
    <DragDropItemDndContext.Provider value={contextValues}>
      <DragDropProvider<DragDropItemData>
        sensors={DND_KIT_SENSORS}
        onDragStart={handlers.onDragStart}
        onDragMove={handlers.onDragMove}
        onDragEnd={handlers.onDragEnd}
      >
        {children}
      </DragDropProvider>
    </DragDropItemDndContext.Provider>
  );
};
