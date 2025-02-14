import {
  IconArchive,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTextSize,
  LightIconButton,
  MenuItem,
} from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

type SettingsObjectFieldActiveActionDropdownProps = {
  isCustomField?: boolean;
  onDeactivate?: () => void;
  onEdit: () => void;
  onSetAsLabelIdentifier?: () => void;
  scopeKey: string;
};

export const SettingsObjectFieldActiveActionDropdown = ({
  isCustomField,
  onDeactivate,
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

  const handleDeactivate = () => {
    onDeactivate?.();
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
        <LightIconButton
          aria-label="Active Field Options"
          Icon={IconDotsVertical}
          accent="tertiary"
        />
      }
      dropdownMenuWidth={160}
      dropdownComponents={
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
          {!!onDeactivate && (
            <MenuItem
              text="Deactivate"
              LeftIcon={IconArchive}
              onClick={handleDeactivate}
            />
          )}
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
