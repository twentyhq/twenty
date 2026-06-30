import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import type { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationDragSourceContext } from '@/navigation-menu-item/common/contexts/NavigationDragSourceContext';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import type { DraggableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDraggableData';
import { useNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/hooks/useNavigationMenuItemDndKit';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';

type NavigationMenuItemDndKitProviderProps = {
  section: NavigationSections;
  children: ReactNode;
};

export const NavigationMenuItemDndKitProvider = ({
  section,
  children,
}: NavigationMenuItemDndKitProviderProps) => {
  const { contextValues, handlers } = useNavigationMenuItemDndKit(section);

  return (
    <NavigationDragSourceContext.Provider value={contextValues.dragSource}>
      <NavigationMenuItemDragContext.Provider value={contextValues.drag}>
        <NavigationDropTargetContext.Provider value={contextValues.dropTarget}>
          <DragDropProvider<DraggableData>
            sensors={DND_KIT_SENSORS}
            onDragStart={handlers.onDragStart}
            onDragOver={handlers.onDragOver}
            onDragEnd={handlers.onDragEnd}
          >
            {children}
          </DragDropProvider>
        </NavigationDropTargetContext.Provider>
      </NavigationMenuItemDragContext.Provider>
    </NavigationDragSourceContext.Provider>
  );
};
