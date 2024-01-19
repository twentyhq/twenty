import { IconArchiveOff, IconDotsVertical } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import useI18n from '@/ui/i18n/useI18n';

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
  const { translate } = useI18n('translations');
  const dropdownId = `${scopeKey}-settings-field-disabled-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleActivate = () => {
    onActivate();
    closeDropdown();
  };

  // const handleErase = () => {
  //   onErase();
  //   closeDropdown();
  // };

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
        scope: dropdownId,
      }}
    />
  );
};
