import {
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { ViewKey } from '@/views/types/ViewKey';

type WorkspaceNavigationMenuItemFolderDragCloneProps = {
  draggableProvided: DraggableProvided;
  draggableSnapshot: DraggableStateSnapshot;
  rubric: DraggableRubric;
  navigationMenuItems: ProcessedNavigationMenuItem[];
  navigationMenuItemFolderContentLength: number;
  selectedNavigationMenuItemIndex: number;
};

export const WorkspaceNavigationMenuItemFolderDragClone = ({
  draggableProvided,
  draggableSnapshot,
  rubric,
  navigationMenuItems,
  navigationMenuItemFolderContentLength,
  selectedNavigationMenuItemIndex,
}: WorkspaceNavigationMenuItemFolderDragCloneProps) => {
  const { theme } = useContext(ThemeContext);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const navigationMenuItem = navigationMenuItems[rubric.source.index];

  if (!isDefined(navigationMenuItem)) {
    return null;
  }

  return (
    <div
      ref={draggableProvided.innerRef}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...draggableProvided.draggableProps}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...draggableProvided.dragHandleProps}
      style={{
        ...draggableProvided.draggableProps.style,
        background: draggableSnapshot.isDragging
          ? theme.background.transparent.light
          : undefined,
      }}
    >
      <NavigationDrawerSubItem
        secondaryLabel={
          navigationMenuItem.viewKey === ViewKey.Index
            ? undefined
            : getNavigationMenuItemSecondaryLabel({
                objectMetadataItems,
                navigationMenuItemObjectNameSingular:
                  navigationMenuItem.objectNameSingular,
              })
        }
        label={navigationMenuItem.labelIdentifier}
        Icon={() => (
          <NavigationMenuItemIcon navigationMenuItem={navigationMenuItem} />
        )}
        to={undefined}
        active={false}
        isDragging={true}
        subItemState={getNavigationSubItemLeftAdornment({
          index: rubric.source.index,
          arrayLength: navigationMenuItemFolderContentLength,
          selectedIndex: selectedNavigationMenuItemIndex,
        })}
        triggerEvent="CLICK"
      />
    </div>
  );
};
