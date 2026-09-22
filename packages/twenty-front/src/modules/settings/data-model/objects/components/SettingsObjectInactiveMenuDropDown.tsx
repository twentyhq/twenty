import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
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
import { LightIconButton } from 'twenty-ui/components';
import { Menu } from 'twenty-ui/primitives/surfaces';

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
    <DropdownMenu
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton
          aria-label={t`Inactive Object Options`}
          emphasis="subtle"
        >
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <Menu.Group>
            <Menu.Item
              startIcon={isEditable ? <IconPencil /> : <IconEye />}
              onClick={handleEdit}
            >
              {isEditable ? t`Edit` : t`View`}
            </Menu.Item>
            {!isReadOnly && (
              <Menu.Item
                startIcon={<IconArchiveOff />}
                onClick={handleActivate}
              >{t`Activate`}</Menu.Item>
            )}
            {isCustomObject && !isReadOnly && (
              <Menu.Item
                startIcon={<IconTrash />}
                color="danger"
                onClick={handleDelete}
              >{t`Delete`}</Menu.Item>
            )}
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
