import { PointerActivationConstraints } from '@dnd-kit/dom';
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react';
import type { ReactNode } from 'react';

import type { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationDragSourceContext } from '@/navigation-menu-item/common/contexts/NavigationDragSourceContext';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import type { DraggableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDraggableData';
import { useNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/hooks/useNavigationMenuItemDndKit';

const NAVIGATION_MENU_ITEM_DND_SENSORS = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
  }),
  KeyboardSensor,
];

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
            sensors={NAVIGATION_MENU_ITEM_DND_SENSORS}
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
