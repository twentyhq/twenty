import { DragDropProvider } from '@dnd-kit/react';
import { type ReactNode } from 'react';

import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { type DragDropItemDropTargetOrientation } from '@/ui/utilities/drag-and-drop/types/DragDropItemDropTargetOrientation';
import {
  type DragDropInsertionDropEvent,
  useDragDropInsertionIndex,
} from '@/ui/utilities/drag-and-drop/hooks/useDragDropInsertionIndex';

type DragDropItemDndProviderProps = {
  children: ReactNode;
  // Fallback split axis; omit when sortables tag their own orientation.
  orientation?: DragDropItemDropTargetOrientation;
  getDroppableItemCount: (droppableId: string) => number;
  onDrop: (dropEvent: DragDropInsertionDropEvent) => void;
};

// Wires the shared insertion-index engine to a dnd-kit provider and publishes
// the active drop target through context for DragDropItemDropTarget slots.
export const DragDropItemDndProvider = ({
  children,
  orientation,
  getDroppableItemCount,
  onDrop,
}: DragDropItemDndProviderProps) => {
  const { contextValues, handlers } = useDragDropInsertionIndex({
    orientation,
    getDroppableItemCount,
    onDrop,
  });

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
      </DragDropProvider>
    </DragDropItemDndContext.Provider>
  );
};
