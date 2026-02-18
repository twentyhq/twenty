import styled from '@emotion/styled';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import { NavigationSections } from '@/navigation-menu-item/constants/NavigationSections.constants';
import { NavigationMenuItemDroppable } from '@/navigation-menu-item/components/NavigationMenuItemDroppable';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/hooks/useSortedNavigationMenuItems';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/utils/isLocationMatchingNavigationMenuItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

const StyledEmptyContainer = styled.div`
  width: 100%;
`;

const StyledOrphanNavigationMenuItemsContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.betweenSiblingsGap};
`;

export const CurrentWorkspaceMemberOrphanNavigationMenuItems = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;
  const { isDragging } = useContext(NavigationMenuItemDragContext);

  const orphanNavigationMenuItems = navigationMenuItemsSorted.filter(
    (item) => !item.folderId,
  );

  return (
    <NavigationMenuItemDroppable
      droppableId={NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS}
      isWorkspaceSection={false}
    >
      {orphanNavigationMenuItems.length > 0 ? (
        <>
          {orphanNavigationMenuItems.map((navigationMenuItem, index) => (
            <NavigationItemDropTarget
              key={navigationMenuItem.id}
              folderId={null}
              index={index}
              sectionId={NavigationSections.FAVORITES}
            >
              <DraggableItem
                draggableId={navigationMenuItem.id}
                index={index}
                isInsideScrollableContainer={true}
                itemComponent={
                  <StyledOrphanNavigationMenuItemsContainer>
                    <NavigationDrawerItem
                      secondaryLabel={getNavigationMenuItemSecondaryLabel({
                        objectMetadataItems,
                        navigationMenuItemObjectNameSingular:
                          navigationMenuItem.objectNameSingular,
                      })}
                      label={navigationMenuItem.labelIdentifier}
                      Icon={() => (
                        <NavigationMenuItemIcon
                          navigationMenuItem={navigationMenuItem}
                        />
                      )}
                      active={isLocationMatchingNavigationMenuItem(
                        currentPath,
                        currentViewPath,
                        navigationMenuItem,
                      )}
                      to={isDragging ? undefined : navigationMenuItem.link}
                      rightOptions={
                        <LightIconButton
                          Icon={IconHeartOff}
                          onClick={() =>
                            deleteNavigationMenuItem(navigationMenuItem.id)
                          }
                          accent="tertiary"
                        />
                      }
                      isDragging={isDragging}
                      triggerEvent="CLICK"
                    />
                  </StyledOrphanNavigationMenuItemsContainer>
                }
              />
            </NavigationItemDropTarget>
          ))}
          <NavigationItemDropTarget
            folderId={null}
            index={orphanNavigationMenuItems.length}
            sectionId={NavigationSections.FAVORITES}
          />
        </>
      ) : (
        <StyledEmptyContainer style={{ height: isDragging ? '24px' : '1px' }} />
      )}
    </NavigationMenuItemDroppable>
  );
};
