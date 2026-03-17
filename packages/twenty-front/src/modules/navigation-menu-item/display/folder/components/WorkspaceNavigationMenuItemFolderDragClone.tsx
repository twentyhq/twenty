import {
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { ViewKey } from '@/views/types/ViewKey';

type WorkspaceNavigationMenuItemFolderDragCloneProps = {
  draggableProvided: DraggableProvided;
  draggableSnapshot: DraggableStateSnapshot;
  rubric: DraggableRubric;
  navigationMenuItems: NavigationMenuItem[];
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
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const navigationMenuItem = navigationMenuItems[rubric.source.index];

  if (!isDefined(navigationMenuItem)) {
    return null;
  }

  const label = getNavigationMenuItemLabel(
    navigationMenuItem,
    objectMetadataItems,
    views,
  );
  const objectNameSingular = getNavigationMenuItemObjectNameSingular(
    navigationMenuItem,
    objectMetadataItems,
    views,
  );
  const view = isDefined(navigationMenuItem.viewId)
    ? views.find((view) => view.id === navigationMenuItem.viewId)
    : undefined;
  const isIndexView = view?.key === ViewKey.INDEX;

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
          isIndexView
            ? undefined
            : getObjectNavigationMenuItemSecondaryLabel({
                objectMetadataItems,
                navigationMenuItemObjectNameSingular: objectNameSingular ?? '',
              })
        }
        label={label}
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
