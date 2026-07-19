import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { useRecordCalendarDndKit } from '@/object-record/record-calendar/record-calendar-dnd/hooks/useRecordCalendarDndKit';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropColumnDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropColumnDndContext';
import { type DragDropColumnData } from '@/ui/utilities/drag-and-drop/types/DragDropColumnData';

type RecordCalendarDndKitProviderProps = {
  children: ReactNode;
};

export const RecordCalendarDndKitProvider = ({
  children,
}: RecordCalendarDndKitProviderProps) => {
  const { contextValues, handlers } = useRecordCalendarDndKit();

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
