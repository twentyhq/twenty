import { isDefined } from 'twenty-shared/utils';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import {
  FOLDER_HEADER_SLOT_COLLISION_PRIORITY,
  NavigationMenuItemDroppableSlot,
} from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemDroppableSlot';
import { NavigationMenuItemSortableItem } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemSortableItem';
import { useIsDropDisabledForSection } from '@/navigation-menu-item/display/dnd/hooks/useIsDropDisabledForSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';

import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import { getNavigationMenuItemListDroppableId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemListDroppableId';
import { NavigationMenuItemDisplay } from '@/navigation-menu-item/display/components/NavigationMenuItemDisplay';
import { NavigationMenuItemOrphanDropTarget } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemOrphanDropTarget';
import type { NavigationMenuItemSectionListDndKitProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionListDndKitProps';
import { WorkspaceSectionAddMenuItemButton } from '@/navigation-menu-item/edit/components/WorkspaceSectionAddMenuItemButton';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

type WorkspaceSectionListDndKitProps = NavigationMenuItemSectionListDndKitProps;

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
  containerId,
  filteredItems,
  getEditModeProps,
  folderChildrenById,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
}: WorkspaceSectionListDndKitProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const workspaceDropDisabled = useIsDropDisabledForSection(true);
  const { isDragging } = useContext(NavigationMenuItemDragContext);
  const folderCount = filteredItems.filter(
    (item) => item.type === NavigationMenuItemType.FOLDER,
  ).length;
  const isAddMenuItemButtonVisible = isLayoutCustomizationModeEnabled;
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const orphanAppendDndIndex = filteredItems.length;
  const listDroppableId = getNavigationMenuItemListDroppableId({
    parentId: containerId,
    navigationMenuItemSection: 'workspace',
  });
  return (
    <StyledList>
      {filteredItems.map((item, index) => (
        <StyledListItemRow key={item.id}>
          <NavigationMenuItemOrphanDropTarget
            index={index}
            compact
            droppableId={listDroppableId}
            parentId={containerId ?? null}
          />
          <NavigationMenuItemSortableItem
            id={item.id}
            index={index}
            group={listDroppableId}
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
              onNavigationMenuItemClick={onNavigationMenuItemClick}
              onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
              orphanIndex={index}
            />
          </NavigationMenuItemSortableItem>
        </StyledListItemRow>
      ))}
      <NavigationMenuItemDroppableSlot
        droppableId={listDroppableId}
        index={orphanAppendDndIndex}
        disabled={workspaceDropDisabled}
        collisionPriority={FOLDER_HEADER_SLOT_COLLISION_PRIORITY}
      >
        <NavigationMenuItemOrphanDropTarget
          index={orphanAppendDndIndex}
          compact
          highlightPosition="top"
          droppableId={listDroppableId}
          parentId={containerId ?? null}
        />
        {isAddMenuItemButtonVisible && (
          <WorkspaceSectionAddMenuItemButton
            container={
              isDefined(containerId)
                ? {
                    id: containerId,
                    itemCount: workspaceNavigationMenuItems.filter(
                      (item) => item.parentId === containerId,
                    ).length,
                  }
                : undefined
            }
          />
        )}
      </NavigationMenuItemDroppableSlot>
    </StyledList>
  );
};
