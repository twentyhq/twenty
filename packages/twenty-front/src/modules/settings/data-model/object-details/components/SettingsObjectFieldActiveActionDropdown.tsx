import {
  IconArchive,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTextSize,
} from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsObjectFieldActiveActionDropdownProps = {
  isCustomField?: boolean;
  onDisable?: () => void;
  onEdit: () => void;
  onSetAsLabelIdentifier?: () => void;
  scopeKey: string;
};

export const SettingsObjectFieldActiveActionDropdown = ({
  isCustomField,
  onDisable,
  onEdit,
  onSetAsLabelIdentifier,
  scopeKey,
}: SettingsObjectFieldActiveActionDropdownProps) => {
  const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleEdit = () => {
    onEdit();
    closeDropdown();
  };

  const handleDisable = () => {
    onDisable?.();
    closeDropdown();
  };

  const handleSetAsLabelIdentifier = () => {
    onSetAsLabelIdentifier?.();
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
              text={isCustomField ? 'Edit' : 'View'}
              LeftIcon={isCustomField ? IconPencil : IconEye}
              onClick={handleEdit}
            />
            {!!onSetAsLabelIdentifier && (
              <MenuItem
                text="Set as record text"
                LeftIcon={IconTextSize}
                onClick={handleSetAsLabelIdentifier}
              />
            )}
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
        scope: dropdownId,
      }}
    />
  );
};
