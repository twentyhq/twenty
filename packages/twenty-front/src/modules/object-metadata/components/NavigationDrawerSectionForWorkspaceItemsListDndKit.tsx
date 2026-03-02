import styled from '@emotion/styled';
import React from 'react';
import { IconPlus } from 'twenty-ui/display';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { WorkspaceDndKitDroppableSlot } from '@/navigation-menu-item/components/WorkspaceDndKitDroppableSlot';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/components/WorkspaceDndKitSortableItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

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
  isEditMode,
  isDragging,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
  objectMetadataItems,
  views,
  isAddMenuItemButtonVisible,
  addToNavigationFallbackDestination,
  onAddMenuItem,
  addMenuItemLabel,
}: WorkspaceSectionListDndKitProps) => {
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
            disabled={!isEditMode || workspaceDropDisabled}
          >
            <WorkspaceSectionItemContent
              item={item}
              editModeProps={getEditModeProps(item)}
              useDndKit
              isEditMode={isEditMode}
              isDragging={isDragging}
              folderChildrenById={folderChildrenById}
              folderCount={folderCount}
              selectedNavigationMenuItemId={selectedNavigationMenuItemId}
              onNavigationMenuItemClick={onNavigationMenuItemClick}
              onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
              objectMetadataItems={objectMetadataItems}
              views={views}
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
