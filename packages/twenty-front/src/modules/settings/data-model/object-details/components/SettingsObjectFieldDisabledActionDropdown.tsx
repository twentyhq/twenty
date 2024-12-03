import {
  IconArchiveOff,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
  LightIconButton,
  MenuItem,
} from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SettingsObjectFieldInactiveActionDropdownProps = {
  isCustomField?: boolean;
  fieldType?: FieldMetadataType;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  scopeKey: string;
};

export const SettingsObjectFieldInactiveActionDropdown = ({
  onActivate,
  scopeKey,
  onDelete,
  onEdit,
  isCustomField,
}: SettingsObjectFieldInactiveActionDropdownProps) => {
  const dropdownId = `${scopeKey}-settings-field-disabled-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleActivate = () => {
    onActivate();
    closeDropdown();
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown();
  };

  const handleEdit = () => {
    onEdit();
    closeDropdown();
  };

  const isDeletable = isCustomField;

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton
          aria-label="Inactive Field Options"
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
          <MenuItem
            text="Activate"
            LeftIcon={IconArchiveOff}
            onClick={handleActivate}
          />
          {isDeletable && (
            <MenuItem
              text="Delete"
              accent="danger"
              LeftIcon={IconTrash}
              onClick={handleDelete}
            />
          )}
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
    />
  );
};
