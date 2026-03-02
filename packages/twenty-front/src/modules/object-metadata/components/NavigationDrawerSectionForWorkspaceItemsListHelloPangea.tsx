import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { IconPlus } from 'twenty-ui/display';

import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/constants/NavigationSections.constants';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

import { WorkspaceSectionItemContent } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemContent';
import type { WorkspaceSectionListHelloPangeaProps } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsTypes';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
`;

export const WorkspaceSectionListHelloPangea = ({
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
}: WorkspaceSectionListHelloPangeaProps) => {
  return (
    <Droppable
      droppableId={
        NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS
      }
      isDropDisabled={workspaceDropDisabled}
    >
      {(provided) => (
        <StyledList
          ref={provided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...provided.droppableProps}
        >
          {filteredItems.map((item, index) => (
            <NavigationItemDropTarget
              key={item.id}
              folderId={null}
              index={index}
              sectionId={NavigationSections.WORKSPACE}
            >
              <DraggableItem
                draggableId={item.id}
                index={index}
                isInsideScrollableContainer
                isDragDisabled={!isEditMode}
                disableInteractiveElementBlocking={isEditMode}
                itemComponent={
                  <WorkspaceSectionItemContent
                    item={item}
                    editModeProps={getEditModeProps(item)}
                    useDndKit={false}
                    isEditMode={isEditMode}
                    isDragging={isDragging}
                    folderChildrenById={folderChildrenById}
                    folderCount={folderCount}
                    selectedNavigationMenuItemId={selectedNavigationMenuItemId}
                    onNavigationMenuItemClick={onNavigationMenuItemClick}
                    onActiveObjectMetadataItemClick={
                      onActiveObjectMetadataItemClick
                    }
                    objectMetadataItems={objectMetadataItems}
                    views={views}
                  />
                }
              />
            </NavigationItemDropTarget>
          ))}
          <NavigationItemDropTarget
            folderId={null}
            index={filteredItems.length}
            sectionId={NavigationSections.WORKSPACE}
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
          </NavigationItemDropTarget>
          {addToNavigationFallbackDestination?.droppableId ===
            NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS &&
            addToNavigationFallbackDestination.index > filteredItems.length && (
              <NavigationItemDropTarget
                folderId={null}
                index={addToNavigationFallbackDestination.index}
                sectionId={NavigationSections.WORKSPACE}
                compact
              />
            )}
          {provided.placeholder}
        </StyledList>
      )}
    </Droppable>
  );
};
