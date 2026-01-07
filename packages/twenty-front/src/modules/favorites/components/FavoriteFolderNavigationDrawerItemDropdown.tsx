import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { IconDotsVertical, IconPencil, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

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
  const { t } = useLingui();
  const handleRename = () => {
    closeDropdown();
    onRename();
  };

  const handleDelete = () => {
    closeDropdown();
    onDelete();
  };

  return (
    <Dropdown
      dropdownId={`favorite-folder-edit-${folderId}`}
      data-select-disable
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownPlacement="bottom-start"
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconPencil}
              onClick={handleRename}
              accent="default"
              text={t`Rename`}
            />
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
