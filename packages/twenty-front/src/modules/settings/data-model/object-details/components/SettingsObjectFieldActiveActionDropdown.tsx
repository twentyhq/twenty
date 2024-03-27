import {
  Dropdown,
  DropdownMenu,
  DropdownMenuItemsContainer,
  IconArchive,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTextSize,
  LightIconButton,
  MenuItem,
  useDropdown,
} from 'twenty-ui';

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
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownMenu width="160px">
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
        </DropdownMenu>
      }
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
    />
  );
};
