import { PointerActivationConstraints } from '@dnd-kit/dom';
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { NavigationDragSourceContext } from '@/navigation-menu-item/common/contexts/NavigationDragSourceContext';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import type { DraggableData } from '@/navigation/types/workspaceDndKitDraggableData';

import { useFavoritesDndKit } from '@/navigation/hooks/useFavoritesDndKit';

const FAVORITES_DND_SENSORS = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
  }),
  KeyboardSensor,
];

type FavoritesDndKitProviderProps = {
  children: ReactNode;
};

export const FavoritesDndKitProvider = ({
  children,
}: FavoritesDndKitProviderProps) => {
  const { contextValues, handlers } = useFavoritesDndKit();

  return (
    <NavigationDragSourceContext.Provider value={contextValues.dragSource}>
      <NavigationMenuItemDragContext.Provider value={contextValues.drag}>
        <NavigationDropTargetContext.Provider value={contextValues.dropTarget}>
          <DragDropProvider<DraggableData>
            sensors={FAVORITES_DND_SENSORS}
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
