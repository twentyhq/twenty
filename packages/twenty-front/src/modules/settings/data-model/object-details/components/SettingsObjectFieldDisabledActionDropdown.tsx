import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { t } from '@lingui/core/macro';
import {
  IconArchiveOff,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
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
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            <MenuItem
              text={isCustomField ? t`Edit` : t`View`}
              LeftIcon={isCustomField ? IconPencil : IconEye}
              onClick={handleEdit}
            />
            <MenuItem
              text={t`Activate`}
              LeftIcon={IconArchiveOff}
              onClick={handleActivate}
            />
            {isDeletable && (
              <MenuItem
                text={t`Delete`}
                accent="danger"
                LeftIcon={IconTrash}
                onClick={handleDelete}
              />
            )}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
