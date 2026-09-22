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
import { type FieldMetadataType } from '~/generated-metadata/graphql';
import { Menu } from 'twenty-ui/primitives/surfaces';

type SettingsObjectFieldInactiveActionDropdownProps = {
  isCustomField?: boolean;
  isSystemField?: boolean;
  fieldType?: FieldMetadataType;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  fieldMetadataItemId: string;
  readonly?: boolean;
};

export const SettingsObjectFieldInactiveActionDropdown = ({
  onActivate,
  readonly = false,
  fieldMetadataItemId,
  onDelete,
  onEdit,
  isCustomField,
  isSystemField,
}: SettingsObjectFieldInactiveActionDropdownProps) => {
  const dropdownId = `${fieldMetadataItemId}-settings-field-disabled-action-dropdown`;

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

  const isDeletable = isCustomField && !isSystemField;

  return (
    <DropdownMenu
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton
          aria-label={t`Inactive Field Options`}
          emphasis="subtle"
        >
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <Menu.Group>
            <Menu.Item
              startIcon={isCustomField ? <IconPencil /> : <IconEye />}
              onClick={handleEdit}
            >
              {isCustomField && !readonly ? t`Edit` : t`View`}
            </Menu.Item>
            {!readonly && (
              <Menu.Item
                startIcon={<IconArchiveOff />}
                onClick={handleActivate}
              >{t`Activate`}</Menu.Item>
            )}
            {isDeletable && !readonly && (
              <Menu.Item
                color="danger"
                startIcon={<IconTrash />}
                onClick={handleDelete}
              >{t`Delete`}</Menu.Item>
            )}
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
