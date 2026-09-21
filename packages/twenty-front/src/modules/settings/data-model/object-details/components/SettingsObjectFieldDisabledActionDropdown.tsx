import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
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
import { LightIconButton } from 'twenty-ui/components';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

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
    <Dropdown
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
          <DropdownMenuItemsContainer>
            <ListItem
              startIcon={
                <SelectOptionIcon Icon={isCustomField ? IconPencil : IconEye} />
              }
              onClick={getDropdownMenuItemClickHandler(handleEdit)}
            >
              <OverflowingTextWithTooltip
                text={isCustomField && !readonly ? t`Edit` : t`View`}
              />
            </ListItem>
            {!readonly && (
              <ListItem
                startIcon={<IconArchiveOff />}
                onClick={getDropdownMenuItemClickHandler(handleActivate)}
              >
                <OverflowingTextWithTooltip text={t`Activate`} />
              </ListItem>
            )}
            {isDeletable && !readonly && (
              <ListItem
                color="danger"
                startIcon={<IconTrash />}
                onClick={getDropdownMenuItemClickHandler(handleDelete)}
              >
                <OverflowingTextWithTooltip text={t`Delete`} />
              </ListItem>
            )}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
