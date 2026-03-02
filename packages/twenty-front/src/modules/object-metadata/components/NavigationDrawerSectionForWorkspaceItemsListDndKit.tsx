import styled from '@emotion/styled';
import React from 'react';
import { IconPlus } from 'twenty-ui/display';

import { WorkspaceDndKitDroppableSlot } from '@/navigation-menu-item/components/WorkspaceDndKitDroppableSlot';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/components/WorkspaceDndKitSortableItem';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { WorkspaceSectionItemContent } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemContent';
import type { WorkspaceSectionListDndKitProps } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsTypes';
import { WorkspaceOrphanDropTarget } from '@/object-metadata/components/WorkspaceOrphanDropTarget';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
`;

export const WorkspaceSectionListDndKit = ({
  filteredItems,
  getEditModeProps,
  folderChildrenById,
  folderCount,
  workspaceDropDisabled,
  isDragging,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
  isAddMenuItemButtonVisible,
  addToNavigationFallbackDestination,
  onAddMenuItem,
  addMenuItemLabel,
}: WorkspaceSectionListDndKitProps) => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  return (
    <StyledList
      data-dnd-group={
        NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS
      }
    >
      {filteredItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <WorkspaceOrphanDropTarget index={index} compact />
          <WorkspaceDndKitSortableItem
            id={item.id}
            index={index}
            group={
              NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS
            }
            disabled={!isNavigationMenuInEditMode || workspaceDropDisabled}
          >
            <WorkspaceSectionItemContent
              item={item}
              editModeProps={getEditModeProps(item)}
              isDragging={isDragging}
              folderChildrenById={folderChildrenById}
              folderCount={folderCount}
              selectedNavigationMenuItemId={selectedNavigationMenuItemId}
              onNavigationMenuItemClick={onNavigationMenuItemClick}
              onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
            />
          </WorkspaceDndKitSortableItem>
        </React.Fragment>
      ))}
      <WorkspaceDndKitDroppableSlot
        droppableId={
          NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS
        }
        index={filteredItems.length}
        disabled={workspaceDropDisabled}
      >
        <WorkspaceOrphanDropTarget
          index={filteredItems.length}
          compact={!isAddMenuItemButtonVisible}
        >
          {isAddMenuItemButtonVisible && (
            <NavigationDrawerItem
              Icon={IconPlus}
              label={addMenuItemLabel}
              onClick={onAddMenuItem}
              triggerEvent="CLICK"
            />
          )}
        </WorkspaceOrphanDropTarget>
      </WorkspaceDndKitDroppableSlot>
      {addToNavigationFallbackDestination?.droppableId ===
        NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS &&
        addToNavigationFallbackDestination.index > filteredItems.length && (
          <WorkspaceDndKitDroppableSlot
            droppableId={
              NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS
            }
            index={addToNavigationFallbackDestination.index}
            disabled={workspaceDropDisabled}
          >
            <WorkspaceOrphanDropTarget
              index={addToNavigationFallbackDestination.index}
              compact
            />
          </WorkspaceDndKitDroppableSlot>
        )}
    </StyledList>
  );
};
