import { Droppable } from '@hello-pangea/dnd';
import { IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemBackButton } from '@/navigation-menu-item/components/NavigationMenuItemBackButton';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemLabel';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/utils/getNavigationMenuItemObjectNameSingular';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
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

  return (
    <>
      <NavigationMenuItemBackButton folderName={folderName} />
      <Droppable droppableId={`folder-${folderId}`}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
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
              const objectNameSingular =
                getNavigationMenuItemObjectNameSingular(
                  navigationMenuItem,
                  objectMetadataItems,
                  views,
                );

              return (
                <DraggableItem
                  key={navigationMenuItem.id}
                  draggableId={navigationMenuItem.id}
                  index={index}
                  isInsideScrollableContainer
                  itemComponent={
                    <NavigationDrawerItem
                      secondaryLabel={getNavigationMenuItemSecondaryLabel({
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
                  }
                />
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  );
};
