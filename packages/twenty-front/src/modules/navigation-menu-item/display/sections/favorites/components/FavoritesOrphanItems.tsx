import { styled } from '@linaria/react';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/display/dnd/components/WorkspaceDndKitSortableItem';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useDeleteNavigationMenuItem';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getEffectiveNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getEffectiveNavigationMenuItemColor';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/common/utils/isLocationMatchingNavigationMenuItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

const StyledEmptyContainer = styled.div`
  width: 100%;
`;

const StyledOrphanNavigationMenuItemsContainer = styled.div`
  margin-bottom: ${themeCssVariables.betweenSiblingsGap};
`;

export const FavoritesOrphanItems = () => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;
  const { isDragging } = useContext(NavigationMenuItemDragContext);

  const orphanNavigationMenuItems = navigationMenuItemsSorted.filter(
    (item) => !item.folderId,
  );

  return orphanNavigationMenuItems.length > 0 ? (
    <>
      {orphanNavigationMenuItems.map((navigationMenuItem, index) => {
        const label = getNavigationMenuItemLabel(
          navigationMenuItem,
          objectMetadataItems,
          views,
        );
        const computedLink = getNavigationMenuItemComputedLink(
          navigationMenuItem,
          objectMetadataItems,
          views,
        );
        const objectNameSingular = getNavigationMenuItemObjectNameSingular(
          navigationMenuItem,
          objectMetadataItems,
          views,
        );

        return (
          <WorkspaceDndKitSortableItem
            key={navigationMenuItem.id}
            id={navigationMenuItem.id}
            index={index}
            group={NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS}
          >
            <StyledOrphanNavigationMenuItemsContainer>
              <NavigationDrawerItem
                secondaryLabel={getObjectNavigationMenuItemSecondaryLabel({
                  objectMetadataItems,
                  navigationMenuItemObjectNameSingular:
                    objectNameSingular ?? '',
                })}
                label={label}
                Icon={() => (
                  <NavigationMenuItemIcon
                    navigationMenuItem={navigationMenuItem}
                  />
                )}
                iconColor={getEffectiveNavigationMenuItemColor(
                  navigationMenuItem,
                )}
                active={isLocationMatchingNavigationMenuItem(
                  currentPath,
                  currentViewPath,
                  navigationMenuItem.type,
                  computedLink,
                )}
                to={isDragging ? undefined : computedLink}
                rightOptions={
                  <LightIconButton
                    Icon={IconHeartOff}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNavigationMenuItem(navigationMenuItem.id);
                    }}
                    accent="tertiary"
                  />
                }
                isDragging={isDragging}
                triggerEvent="CLICK"
              />
            </StyledOrphanNavigationMenuItemsContainer>
          </WorkspaceDndKitSortableItem>
        );
      })}
    </>
  ) : (
    <StyledEmptyContainer style={{ height: isDragging ? '24px' : '1px' }} />
  );
};
