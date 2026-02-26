import { IconPlus } from 'twenty-ui/display';

import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import { WorkspaceDndKitDroppableSlot } from '@/navigation-menu-item/components/WorkspaceDndKitDroppableSlot';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/components/WorkspaceDndKitSortableItem';
import { NavigationSections } from '@/navigation-menu-item/constants/NavigationSections.constants';
import { getDndKitDropTargetId } from '@/navigation-menu-item/utils/getDndKitDropTargetId';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

import { WorkspaceSectionItemContent } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemContent';
import {
  StyledWorkspaceDroppableList,
  WORKSPACE_ORPHAN_DROPPABLE_ID,
} from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsShared';
import type { WorkspaceSectionListCommonProps } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsTypes';

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
  theme,
  isAddMenuItemButtonVisible,
  addToNavigationFallbackDestination,
  onAddMenuItem,
  addMenuItemLabel,
}: WorkspaceSectionListCommonProps) => {
  return (
    <StyledWorkspaceDroppableList
      data-dnd-group={WORKSPACE_ORPHAN_DROPPABLE_ID}
    >
      {filteredItems.map((item, index) => (
        <WorkspaceDndKitSortableItem
          key={item.id}
          id={item.id}
          index={index}
          group={WORKSPACE_ORPHAN_DROPPABLE_ID}
          disabled={!isEditMode || workspaceDropDisabled}
        >
          <WorkspaceSectionItemContent
            item={item}
            editModeProps={getEditModeProps(item)}
            useDndKit={true}
            theme={theme}
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
      ))}
      <WorkspaceDndKitDroppableSlot
        droppableId={WORKSPACE_ORPHAN_DROPPABLE_ID}
        index={filteredItems.length}
        disabled={workspaceDropDisabled}
      >
        <NavigationItemDropTarget
          folderId={null}
          index={filteredItems.length}
          sectionId={NavigationSections.WORKSPACE}
          compact={!isAddMenuItemButtonVisible}
          dropTargetIdOverride={getDndKitDropTargetId(
            WORKSPACE_ORPHAN_DROPPABLE_ID,
            filteredItems.length,
          )}
        >
          {isAddMenuItemButtonVisible && (
            <NavigationDrawerItem
              Icon={IconPlus}
              label={addMenuItemLabel}
              onClick={onAddMenuItem}
              triggerEvent="CLICK"
            />
          )}
        </NavigationItemDropTarget>
      </WorkspaceDndKitDroppableSlot>
      {addToNavigationFallbackDestination?.droppableId ===
        WORKSPACE_ORPHAN_DROPPABLE_ID &&
        addToNavigationFallbackDestination.index > filteredItems.length && (
          <WorkspaceDndKitDroppableSlot
            droppableId={WORKSPACE_ORPHAN_DROPPABLE_ID}
            index={addToNavigationFallbackDestination.index}
            disabled={workspaceDropDisabled}
          >
            <NavigationItemDropTarget
              folderId={null}
              index={addToNavigationFallbackDestination.index}
              sectionId={NavigationSections.WORKSPACE}
              compact
              dropTargetIdOverride={getDndKitDropTargetId(
                WORKSPACE_ORPHAN_DROPPABLE_ID,
                addToNavigationFallbackDestination.index,
              )}
            />
          </WorkspaceDndKitDroppableSlot>
        )}
    </StyledWorkspaceDroppableList>
  );
};
