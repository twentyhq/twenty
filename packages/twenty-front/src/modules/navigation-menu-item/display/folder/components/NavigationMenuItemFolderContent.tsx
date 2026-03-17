import { IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemBackButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemBackButton';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/display/dnd/components/WorkspaceDndKitSortableItem';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useDeleteNavigationMenuItem';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

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
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  const folderDroppableId = `folder-${folderId}`;

  return (
    <>
      <NavigationMenuItemBackButton folderName={folderName} />
      {navigationMenuItems.map((navigationMenuItem, index) => {
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
                    deleteNavigationMenuItem(navigationMenuItem.id);
                  }}
                  accent="tertiary"
                />
              }
              triggerEvent="CLICK"
              to={computedLink}
            />
          </WorkspaceDndKitSortableItem>
        );
      })}
    </>
  );
};
