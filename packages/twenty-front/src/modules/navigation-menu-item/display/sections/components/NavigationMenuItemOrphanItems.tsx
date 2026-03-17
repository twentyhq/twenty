import { styled } from '@linaria/react';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useDeleteNavigationMenuItem';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { getEffectiveNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getEffectiveNavigationMenuItemColor';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/common/utils/isLocationMatchingNavigationMenuItem';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { NavigationItemDropTarget } from '@/navigation-menu-item/display/dnd/components/NavigationItemDropTarget';
import { NavigationMenuItemSortableItem } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemSortableItem';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

const StyledEmptyContainer = styled.div`
  width: 100%;
`;

const StyledOrphanNavigationMenuItemsContainer = styled.div`
  margin-bottom: ${themeCssVariables.betweenSiblingsGap};
`;

type NavigationMenuItemOrphanItemsProps = {
  section: NavigationSections;
};

export const NavigationMenuItemOrphanItems = ({
  section,
}: NavigationMenuItemOrphanItemsProps) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;
  const { isDragging } = useContext(NavigationMenuItemDragContext);

  const isFavoritesSection = section === NavigationSections.FAVORITES;

  const orphanDroppableId = isFavoritesSection
    ? NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS
    : NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS;

  const orphanNavigationMenuItems = navigationMenuItemsSorted.filter(
    (item) => !item.folderId && !isNavigationMenuItemFolder(item),
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

        const dropTargetOverride = isFavoritesSection
          ? getDndKitDropTargetId(orphanDroppableId, index)
          : undefined;

        return (
          <NavigationMenuItemSortableItem
            key={navigationMenuItem.id}
            id={navigationMenuItem.id}
            index={index}
            group={orphanDroppableId}
          >
            <NavigationItemDropTarget
              folderId={null}
              index={index}
              sectionId={section}
              dropTargetIdOverride={dropTargetOverride}
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
                    isFavoritesSection ? (
                      <LightIconButton
                        Icon={IconHeartOff}
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteNavigationMenuItem(navigationMenuItem.id);
                        }}
                        accent="tertiary"
                      />
                    ) : undefined
                  }
                  isDragging={isDragging}
                  triggerEvent="CLICK"
                />
              </StyledOrphanNavigationMenuItemsContainer>
            </NavigationItemDropTarget>
          </NavigationMenuItemSortableItem>
        );
      })}
    </>
  ) : (
    <StyledEmptyContainer style={{ height: isDragging ? '24px' : '1px' }} />
  );
};
