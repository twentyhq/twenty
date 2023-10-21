import { IconDotsVertical, IconTrash } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { IconArchiveOff } from '@/ui/input/constants/icons';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsObjectDisabledMenuDropDownProps = {
  scopeKey: string;
  handleActivate: () => void;
  handleErase: () => void;
};

export const SettingsObjectDisabledMenuDropDown = ({
  scopeKey,
  handleActivate,
  handleErase,
}: SettingsObjectDisabledMenuDropDownProps) => {
  return (
    <DropdownScope
      dropdownScopeId={scopeKey + '-settings-object-disabled-menu-dropdown'}
    >
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
              <MenuItem
                text="Erase"
                LeftIcon={IconTrash}
                accent="danger"
                onClick={handleErase}
              />
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownHotkeyScope={{
          scope: scopeKey + '-settings-object-disabled-menu-dropdown',
        }}
      />
    </DropdownScope>
  );
};
