import React from 'react';
import { IconPlus } from 'twenty-ui/display';

import { WorkspaceDndKitDroppableSlot } from '@/navigation-menu-item/components/WorkspaceDndKitDroppableSlot';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/components/WorkspaceDndKitSortableItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

import { WorkspaceSectionItemContent } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemContent';
import {
  StyledWorkspaceDroppableList,
  WORKSPACE_ORPHAN_DROPPABLE_ID,
  WorkspaceOrphanDropTarget,
} from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsShared';
import type { WorkspaceSectionListDndKitProps } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsTypes';

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
    <StyledWorkspaceDroppableList
      data-dnd-group={WORKSPACE_ORPHAN_DROPPABLE_ID}
    >
      {filteredItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <WorkspaceOrphanDropTarget index={index} compact />
          <WorkspaceDndKitSortableItem
            id={item.id}
            index={index}
            group={WORKSPACE_ORPHAN_DROPPABLE_ID}
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
        droppableId={WORKSPACE_ORPHAN_DROPPABLE_ID}
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
        WORKSPACE_ORPHAN_DROPPABLE_ID &&
        addToNavigationFallbackDestination.index > filteredItems.length && (
          <WorkspaceDndKitDroppableSlot
            droppableId={WORKSPACE_ORPHAN_DROPPABLE_ID}
            index={addToNavigationFallbackDestination.index}
            disabled={workspaceDropDisabled}
          >
            <WorkspaceOrphanDropTarget
              index={addToNavigationFallbackDestination.index}
              compact
            />
          </WorkspaceDndKitDroppableSlot>
        )}
    </StyledWorkspaceDroppableList>
  );
};
