import { IconArchiveOff, IconDotsVertical, IconTrash } from '@/ui/display/icon';
import useI18n from '@/ui/i18n/useI18n';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsObjectDisabledMenuDropDownProps = {
  isCustomObject: boolean;
  onActivate: () => void;
  onErase: () => void;
  scopeKey: string;
};

export const SettingsObjectDisabledMenuDropDown = ({
  onActivate,
  scopeKey,
  onErase,
  isCustomObject,
}: SettingsObjectDisabledMenuDropDownProps) => {
  const { translate } = useI18n('translations');
  const dropdownId = `${scopeKey}-settings-object-disabled-menu-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleActivate = () => {
    onActivate();
    closeDropdown();
  };

  const handleErase = () => {
    onErase();
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
              text={translate('activate')}
              LeftIcon={IconArchiveOff}
              onClick={handleActivate}
            />
            {isCustomObject && (
              <MenuItem
                text={translate('erase')}
                LeftIcon={IconTrash}
                accent="danger"
                onClick={handleErase}
              />
            )}
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
    />
  );
};
