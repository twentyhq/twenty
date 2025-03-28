import { FavoriteFolderHotkeyScope } from '@/favorites/constants/FavoriteFolderRightIconDropdownHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { IconDotsVertical, IconPencil, IconTrash } from 'twenty-ui/display';

type FavoriteFolderNavigationDrawerItemDropdownProps = {
  folderId: string;
  onRename: () => void;
  onDelete: () => void;
  closeDropdown: () => void;
};

export const FavoriteFolderNavigationDrawerItemDropdown = ({
  folderId,
  onRename,
  onDelete,
  closeDropdown,
}: FavoriteFolderNavigationDrawerItemDropdownProps) => {
  const handleRename = () => {
    onRename();
    closeDropdown();
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown();
  };

  return (
    <Dropdown
      dropdownId={`favorite-folder-edit-${folderId}`}
      dropdownHotkeyScope={{
        scope: FavoriteFolderHotkeyScope.FavoriteFolderRightIconDropdown,
      }}
      data-select-disable
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownPlacement="bottom-start"
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem
            LeftIcon={IconPencil}
            onClick={handleRename}
            accent="default"
            text="Rename"
          />
          <MenuItem
            LeftIcon={IconTrash}
            onClick={handleDelete}
            accent="danger"
            text="Delete"
          />
        </DropdownMenuItemsContainer>
      }
    />
  );
};
