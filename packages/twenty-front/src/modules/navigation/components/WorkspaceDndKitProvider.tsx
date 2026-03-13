import { PointerActivationConstraints } from '@dnd-kit/dom';
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import type { DraggableData } from '@/navigation/types/workspaceDndKitDraggableData';

import { useWorkspaceDndKit } from '@/navigation/hooks/useWorkspaceDndKit';

const WORKSPACE_DND_SENSORS = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
  }),
  KeyboardSensor,
];

type WorkspaceDndKitProviderProps = {
  children: ReactNode;
};

export const WorkspaceDndKitProvider = ({
  children,
}: WorkspaceDndKitProviderProps) => {
  const { contextValues, handlers } = useWorkspaceDndKit();

  return (
    <NavigationDragSourceContext.Provider value={contextValues.dragSource}>
      <NavigationMenuItemDragContext.Provider value={contextValues.drag}>
        <NavigationDropTargetContext.Provider value={contextValues.dropTarget}>
          <DragDropProvider<DraggableData>
            sensors={WORKSPACE_DND_SENSORS}
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
