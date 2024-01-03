import { IconDotsVertical, IconDownload, IconTrash } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type AttachmentDropdownProps = {
  onDownload: () => void;
  onDelete: () => void;
  scopeKey: string;
};

export const AttachmentDropdown = ({
  onDownload,
  onDelete,
  scopeKey,
}: AttachmentDropdownProps) => {
  const dropdownScopeId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownScopeId);

  const handleDownload = () => {
    onDownload();
    closeDropdown();
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown();
  };

  return (
    <DropdownScope dropdownScopeId={dropdownScopeId}>
      <Dropdown
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
                text="Delete"
                accent="danger"
                LeftIcon={IconTrash}
                onClick={handleDelete}
              />
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownHotkeyScope={{
          scope: dropdownScopeId,
        }}
      />
    </DropdownScope>
  );
};
