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
                <SelectOptionIcon Icon={isEditable ? IconPencil : IconEye} />
              }
              onClick={getDropdownMenuItemClickHandler(handleEdit)}
            >
              <OverflowingTextWithTooltip
                text={isEditable ? t`Edit` : t`View`}
              />
            </ListItem>
            {!isReadOnly && (
              <ListItem
                startIcon={<IconArchiveOff />}
                onClick={getDropdownMenuItemClickHandler(handleActivate)}
              >
                <OverflowingTextWithTooltip text={t`Activate`} />
              </ListItem>
            )}
            {isCustomObject && !isReadOnly && (
              <ListItem
                startIcon={<IconTrash />}
                color="danger"
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
