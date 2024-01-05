import {
  IconArchive,
  IconDotsVertical,
  IconEye,
  IconPencil,
} from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsObjectFieldActiveActionDropdownProps = {
  isCustomField?: boolean;
  onDisable?: () => void;
  onEdit: () => void;
  scopeKey: string;
};

export const SettingsObjectFieldActiveActionDropdown = ({
  isCustomField,
  onDisable,
  onEdit,
  scopeKey,
}: SettingsObjectFieldActiveActionDropdownProps) => {
  const dropdownScopeId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownScopeId);

  const handleEdit = () => {
    onEdit();
    closeDropdown();
  };

  const handleDisable = () => {
    onDisable?.();
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
                text={isCustomField ? 'Edit' : 'View'}
                LeftIcon={isCustomField ? IconPencil : IconEye}
                onClick={handleEdit}
              />
              {!!onDisable && (
                <MenuItem
                  text="Disable"
                  LeftIcon={IconArchive}
                  onClick={handleDisable}
                />
              )}
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
