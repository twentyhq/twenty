import { IconArchiveOff, IconDotsVertical } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsObjectFieldDisabledActionDropdownProps = {
  isCustomField?: boolean;
  onActivate: () => void;
  onErase: () => void;
  scopeKey: string;
};

export const SettingsObjectFieldDisabledActionDropdown = ({
  onActivate,
  scopeKey,
}: SettingsObjectFieldDisabledActionDropdownProps) => {
  const dropdownScopeId = `${scopeKey}-settings-field-disabled-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownScopeId);

  const handleActivate = () => {
    onActivate();
    closeDropdown();
  };

  // const handleErase = () => {
  //   onErase();
  //   closeDropdown();
  // };

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
                text="Activate"
                LeftIcon={IconArchiveOff}
                onClick={handleActivate}
              />
              {/* {isCustomField && (
                <MenuItem
                  text="Erase"
                  accent="danger"
                  LeftIcon={IconTrash}
                  onClick={handleErase}
                />
              )} */}
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
