import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import {
  IconArchiveOff,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type SettingsObjectInactiveMenuDropDownProps = {
  isCustomObject: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  objectMetadataItemNamePlural: string;
  isReadOnly?: boolean;
};

export const SettingsObjectInactiveMenuDropDown = ({
  onActivate,
  objectMetadataItemNamePlural,
  onDelete,
  onEdit,
  isCustomObject,
  isReadOnly = false,
}: SettingsObjectInactiveMenuDropDownProps) => {
  const dropdownId = `${objectMetadataItemNamePlural}-settings-object-inactive-menu-dropdown`;

  const { closeDropdown } = useCloseDropdown();

  const handleActivate = () => {
    onActivate();
    closeDropdown(dropdownId);
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown(dropdownId);
  };

  const handleEdit = () => {
    onEdit();
    closeDropdown(dropdownId);
  };

  const isEditable = isCustomObject && !isReadOnly;

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton
          aria-label={t`Inactive Object Options`}
          Icon={IconDotsVertical}
          accent="tertiary"
        />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            <MenuItem
              text={isEditable ? t`Edit` : t`View`}
              LeftIcon={isEditable ? IconPencil : IconEye}
              onClick={handleEdit}
            />
            {!isReadOnly && (
              <MenuItem
                text={t`Activate`}
                LeftIcon={IconArchiveOff}
                onClick={handleActivate}
              />
            )}
            {isCustomObject && !isReadOnly && (
              <MenuItem
                text={t`Delete`}
                LeftIcon={IconTrash}
                accent="danger"
                onClick={handleDelete}
              />
            )}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
