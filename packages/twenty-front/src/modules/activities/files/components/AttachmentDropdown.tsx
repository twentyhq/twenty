import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import {
  IconDotsVertical,
  IconDownload,
  IconPencil,
  IconTrash,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

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
      dropdownWidth={160}
      dropdownComponents={
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
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
