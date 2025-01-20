import {
  IconArchiveOff,
  IconDotsVertical,
  IconTrash,
  LightIconButton,
  MenuItem,
} from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

type SettingsObjectInactiveMenuDropDownProps = {
  isCustomObject: boolean;
  onActivate: () => void;
  onDelete: () => void;
  scopeKey: string;
};

export const SettingsObjectInactiveMenuDropDown = ({
  onActivate,
  scopeKey,
  onDelete,
  isCustomObject,
}: SettingsObjectInactiveMenuDropDownProps) => {
  const dropdownId = `${scopeKey}-settings-object-inactive-menu-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleActivate = () => {
    onActivate();
    closeDropdown();
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton
          aria-label="Inactive Object Options"
          Icon={IconDotsVertical}
          accent="tertiary"
        />
      }
      dropdownMenuWidth={160}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem
            text="Activate"
            LeftIcon={IconArchiveOff}
            onClick={handleActivate}
          />
          {isCustomObject && (
            <MenuItem
              text="Delete"
              LeftIcon={IconTrash}
              accent="danger"
              onClick={handleDelete}
            />
          )}
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
