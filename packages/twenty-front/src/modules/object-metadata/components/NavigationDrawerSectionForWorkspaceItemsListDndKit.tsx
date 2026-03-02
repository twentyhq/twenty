import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React, { useContext } from 'react';
import { IconColumnInsertRight, IconPlus } from 'twenty-ui/display';
import { CommandMenuPages } from 'twenty-shared/types';

import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { WorkspaceDndKitDroppableSlot } from '@/navigation-menu-item/components/WorkspaceDndKitDroppableSlot';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/components/WorkspaceDndKitSortableItem';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useIsDropDisabledForSection } from '@/navigation-menu-item/hooks/useIsDropDisabledForSection';
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
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
}: WorkspaceSectionListDndKitProps) => {
  const { t } = useLingui();
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const workspaceDropDisabled = useIsDropDisabledForSection(true);
  const { isDragging } = useContext(NavigationMenuItemDragContext);
  const { addToNavigationFallbackDestination } = useContext(
    NavigationDropTargetContext,
  );
  const folderCount = filteredItems.filter(
    (item) => item.itemType === NavigationMenuItemType.FOLDER,
  ).length;
  const isAddMenuItemButtonVisible = isNavigationMenuInEditMode && !isDragging;
  const handleAddMenuItem = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    navigateCommandMenu({
      page: CommandMenuPages.NavigationMenuAddItem,
      pageTitle: t`New sidebar item`,
      pageIcon: IconColumnInsertRight,
      resetNavigationStack: true,
    });
  };
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
              label={t`Add menu item`}
              onClick={handleAddMenuItem}
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
