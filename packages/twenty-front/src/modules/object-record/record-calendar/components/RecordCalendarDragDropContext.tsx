import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { useRecordCalendarDndKit } from '@/object-record/record-calendar/hooks/useRecordCalendarDndKit';
import { RecordCalendarCardDragOverlayContent } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardDragOverlayContent';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';

type RecordCalendarDragDropContextProps = {
  children: ReactNode;
};

export const RecordCalendarDragDropContext = ({
  children,
}: RecordCalendarDragDropContextProps) => {
  const { contextValues, handlers } = useRecordCalendarDndKit();

  return (
    <DragDropItemDndContext.Provider value={contextValues}>
      <DragDropProvider<DragDropItemData>
        sensors={DND_KIT_SENSORS}
        plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
        onDragStart={handlers.onDragStart}
        onDragMove={handlers.onDragMove}
        onDragEnd={handlers.onDragEnd}
      >
        {children}
        <DragOverlay>
          {(source) => <RecordCalendarCardDragOverlayContent source={source} />}
        </DragOverlay>
      </DragDropProvider>
    </DragDropItemDndContext.Provider>
  );
};
