import { IconDotsVertical, IconTrash } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { IconArchiveOff } from '@/ui/input/constants/icons';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenu } from '@/ui/layout/dropdown/components/StyledDropdownMenu';
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
      <DropdownMenu
        clickableComponent={
          <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
        }
        dropdownComponents={
          <StyledDropdownMenu width="160px">
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
          </StyledDropdownMenu>
        }
        dropdownHotkeyScope={{
          scope: scopeKey + '-settings-object-disabled-menu-dropdown',
        }}
      />
    </DropdownScope>
  );
};
