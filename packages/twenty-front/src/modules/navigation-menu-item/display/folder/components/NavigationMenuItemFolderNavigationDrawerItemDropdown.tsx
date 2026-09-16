import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { MenuItem } from 'twenty-ui/primitives/navigation';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type NavigationMenuItemFolderNavigationDrawerItemDropdownProps = {
  folderId: string;
  itemCount: number;
  onEdit: () => void;
  onDelete: () => void;
  closeDropdown: () => void;
};

export const NavigationMenuItemFolderNavigationDrawerItemDropdown = ({
  folderId,
  itemCount,
  onEdit,
  onDelete,
  closeDropdown,
}: NavigationMenuItemFolderNavigationDrawerItemDropdownProps) => {
  const { t } = useLingui();
  const handleEdit = () => {
    closeDropdown();
    onEdit();
  };

  const handleDelete = () => {
    closeDropdown();
    onDelete();
  };

  return (
    <Dropdown
      dropdownId={`navigation-menu-item-folder-edit-${folderId}`}
      data-select-disable
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownPlacement="bottom-start"
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconEdit}
              onClick={handleEdit}
              accent="default"
              text={t`Edit`}
            />
            <NavigationMenuItemAddDropdown
              folderId={folderId}
              position={itemCount}
              section="favorite"
              instanceId={`favorite-folder-actions-${folderId}`}
            >
              <MenuItem
                LeftIcon={IconPlus}
                accent="default"
                text={t`Add menu item`}
              />
            </NavigationMenuItemAddDropdown>
            <MenuItem
              LeftIcon={IconTrash}
              onClick={handleDelete}
              accent="danger"
              text={t`Delete`}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
