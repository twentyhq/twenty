import { IconHeartOff } from 'twenty-ui-deprecated/display';
import { LightIconButton } from 'twenty-ui-deprecated/input';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationMenuItemBackButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemBackButton';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { NavigationMenuItemSortableItem } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemSortableItem';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';

type NavigationMenuItemFolderContentProps = {
  folderId: string;
  folderName: string;
  navigationMenuItems: NavigationMenuItem[];
};

export const NavigationMenuItemFolderContent = ({
  folderName,
  folderId,
  navigationMenuItems,
}: NavigationMenuItemFolderContentProps) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const lastVisitedViewPerObjectMetadataItem = useAtomStateValue(
    lastVisitedViewPerObjectMetadataItemState,
  );
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const folderDroppableId = `${NavigationMenuItemDroppableIds.FAVORITE_FOLDER_PREFIX}${folderId}`;

  return (
    <>
      <NavigationMenuItemBackButton folderName={folderName} />
      {navigationMenuItems.map((navigationMenuItem, index) => {
        const label = getNavigationMenuItemLabel(
          navigationMenuItem,
          objectMetadataItems,
          views,
        );
        const computedLink = getNavigationMenuItemComputedLink({
          item: navigationMenuItem,
          objectMetadataItems,
          views,
          lastVisitedViewPerObjectMetadataItem,
        });
        const objectNameSingular = getNavigationMenuItemObjectNameSingular(
          navigationMenuItem,
          objectMetadataItems,
          views,
        );

        return (
          <NavigationMenuItemSortableItem
            key={navigationMenuItem.id}
            id={navigationMenuItem.id}
            index={index}
            group={folderDroppableId}
          >
            <NavigationDrawerItem
              secondaryLabel={getObjectNavigationMenuItemSecondaryLabel({
                objectMetadataItems,
                navigationMenuItemObjectNameSingular: objectNameSingular ?? '',
              })}
              label={label}
              Icon={() => (
                <NavigationMenuItemIcon
                  navigationMenuItem={navigationMenuItem}
                />
              )}
              rightOptions={
                <LightIconButton
                  Icon={IconHeartOff}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteManyNavigationMenuItems([navigationMenuItem.id]);
                  }}
                  accent="tertiary"
                />
              }
              triggerEvent="CLICK"
              to={computedLink}
            />
          </NavigationMenuItemSortableItem>
        );
      })}
    </>
  );
};
