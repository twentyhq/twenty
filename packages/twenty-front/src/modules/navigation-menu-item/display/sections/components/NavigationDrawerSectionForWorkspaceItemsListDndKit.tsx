import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { WorkspaceDndKitDroppableSlot } from '@/navigation-menu-item/display/dnd/components/WorkspaceDndKitDroppableSlot';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/display/dnd/components/WorkspaceDndKitSortableItem';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
import { useIsDropDisabledForSection } from '@/navigation-menu-item/display/dnd/hooks/useIsDropDisabledForSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import { NavigationMenuItemDisplay } from '@/navigation-menu-item/display/components/NavigationMenuItemDisplay';
import { WorkspaceOrphanDropTarget } from '@/navigation-menu-item/display/sections/components/WorkspaceOrphanDropTarget';
import { WorkspaceSectionAddMenuItemButton } from '@/navigation-menu-item/edit/components/WorkspaceSectionAddMenuItemButton';
import type { WorkspaceSectionListDndKitProps } from '@/navigation-menu-item/display/sections/types/WorkspaceSectionListDndKitProps';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding-top: ${themeCssVariables.betweenSiblingsGap};
`;

const StyledListItemRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const WorkspaceSectionListDndKit = ({
  filteredItems,
  getEditModeProps,
  folderChildrenById,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
}: WorkspaceSectionListDndKitProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const workspaceDropDisabled = useIsDropDisabledForSection(true);
  const { isDragging } = useContext(NavigationMenuItemDragContext);
  const { addToNavigationFallbackDestination } = useContext(
    NavigationDropTargetContext,
  );
  const folderCount = filteredItems.filter(
    (item) => item.type === NavigationMenuItemType.FOLDER,
  ).length;
  const isAddMenuItemButtonVisible = isLayoutCustomizationModeEnabled;
  return (
    <StyledList>
      {filteredItems.map((item, index) => (
        <StyledListItemRow key={item.id}>
          <WorkspaceOrphanDropTarget index={index} compact />
          <WorkspaceDndKitSortableItem
            id={item.id}
            index={index}
            group={
              NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS
            }
            disabled={
              !isLayoutCustomizationModeEnabled || workspaceDropDisabled
            }
          >
            <NavigationMenuItemDisplay
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
        </StyledListItemRow>
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
          {isAddMenuItemButtonVisible && <WorkspaceSectionAddMenuItemButton />}
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
