import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArchive,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTextSize,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type SettingsObjectFieldActiveActionDropdownProps = {
  isCustomField?: boolean;
  onDeactivate?: () => void;
  onEdit: () => void;
  onSetAsLabelIdentifier?: () => void;
  fieldMetadataItemId: string;
};

export const SettingsObjectFieldActiveActionDropdown = ({
  isCustomField,
  onDeactivate,
  onEdit,
  onSetAsLabelIdentifier,
  fieldMetadataItemId,
}: SettingsObjectFieldActiveActionDropdownProps) => {
  const dropdownId = `${fieldMetadataItemId}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useCloseDropdown();

  const handleEdit = () => {
    onEdit();
    closeDropdown(dropdownId);
  };

  const handleDeactivate = () => {
    onDeactivate?.();
    closeDropdown(dropdownId);
  };

  const handleSetAsLabelIdentifier = () => {
    onSetAsLabelIdentifier?.();
    closeDropdown(dropdownId);
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
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            <MenuItem
              text={isCustomField ? 'Edit' : 'View'}
              LeftIcon={isCustomField ? IconPencil : IconEye}
              onClick={handleEdit}
            />
            {isDefined(onSetAsLabelIdentifier) && (
              <MenuItem
                text="Set as record text"
                LeftIcon={IconTextSize}
                onClick={handleSetAsLabelIdentifier}
              />
            )}
            {isDefined(onDeactivate) && (
              <MenuItem
                text="Deactivate"
                LeftIcon={IconArchive}
                onClick={handleDeactivate}
              />
            )}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
