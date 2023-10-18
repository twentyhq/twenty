import { IconDotsVertical, IconTrash } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { IconArchiveOff } from '@/ui/input/constants/icons';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsObjectDisabledMenuDropDownProps = {
  scopeKey: string;
};

export const SettingsObjectDisabledMenuDropDown = ({
  scopeKey,
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
          <>
            <MenuItem text="Edit" LeftIcon={IconArchiveOff} />
            <MenuItem text="Erase" LeftIcon={IconTrash} />
          </>
        }
        dropdownHotkeyScope={{
          scope: scopeKey + '-settings-object-disabled-menu-dropdown',
        }}
      />
    </DropdownScope>
  );
};
