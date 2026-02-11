import { Droppable } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';
import { IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

import { NavigationMenuItemBackButton } from '@/navigation-menu-item/components/NavigationMenuItemBackButton';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type NavigationMenuItemFolderContentProps = {
  folderId: string;
  folderName: string;
  navigationMenuItems: ProcessedNavigationMenuItem[];
};

export const NavigationMenuItemFolderContent = ({
  folderName,
  folderId,
  navigationMenuItems,
}: NavigationMenuItemFolderContentProps) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  return (
    <>
      <NavigationMenuItemBackButton folderName={folderName} />
      <Droppable droppableId={`folder-${folderId}`}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {navigationMenuItems.map((navigationMenuItem, index) => (
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
                        navigationMenuItem.objectNameSingular,
                    })}
                    label={navigationMenuItem.labelIdentifier}
                    Icon={() => (
                      <NavigationMenuItemIcon
                        navigationMenuItem={navigationMenuItem}
                      />
                    )}
                    rightOptions={
                      <LightIconButton
                        Icon={IconHeartOff}
                        onClick={() =>
                          deleteNavigationMenuItem(navigationMenuItem.id)
                        }
                        accent="tertiary"
                      />
                    }
                    triggerEvent="CLICK"
                    to={navigationMenuItem.link}
                  />
                }
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  );
};
