import {
  IconDotsVertical,
  IconDownload,
  IconPencil,
  IconTrash,
} from 'twenty-ui';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type AttachmentDropdownProps = {
  onDownload: () => void;
  onDelete: () => void;
  onRename: () => void;
  scopeKey: string;
};

export const AttachmentDropdown = ({
  onDownload,
  onDelete,
  onRename,
  scopeKey,
}: AttachmentDropdownProps) => {
  const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleDownload = () => {
    onDownload();
    closeDropdown();
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown();
  };

  const handleRename = () => {
    onRename();
    closeDropdown();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownMenu width="160px">
          <DropdownMenuItemsContainer>
            <MenuItem
              text="Download"
              LeftIcon={IconDownload}
              onClick={handleDownload}
            />
            <MenuItem
              text="Rename"
              LeftIcon={IconPencil}
              onClick={handleRename}
            />
            <MenuItem
              text="Delete"
              accent="danger"
              LeftIcon={IconTrash}
              onClick={handleDelete}
            />
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
    />
  );
};
