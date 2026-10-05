import { DragDropProvider } from '@dnd-kit/react';
import { type ReactNode } from 'react';

import { usePageLayoutWidgetDragAndDrop } from '@/page-layout/hooks/usePageLayoutWidgetDragAndDrop';
import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';

type PageLayoutWidgetDndProviderProps = {
  children: ReactNode;
};

// Mounted in view mode too so toggling edit mode doesn't remount the layout (scroll, widget state);
// it is inert there since sortables are disabled and the terminal drop target is detached.
export const PageLayoutWidgetDndProvider = ({
  children,
}: PageLayoutWidgetDndProviderProps) => {
  const { contextValues, handlers } = usePageLayoutWidgetDragAndDrop();

  return (
    <DragDropItemDndContext.Provider value={contextValues}>
      <DragDropProvider<PageLayoutWidgetDndData>
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
