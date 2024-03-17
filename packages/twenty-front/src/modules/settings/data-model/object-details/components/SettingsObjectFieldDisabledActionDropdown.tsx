import {
  Dropdown,
  DropdownMenu,
  DropdownMenuItemsContainer,
  IconArchiveOff,
  IconDotsVertical,
  LightIconButton,
  MenuItem,
  useDropdown,
} from 'twenty-ui';

type SettingsObjectFieldInactiveActionDropdownProps = {
  isCustomField?: boolean;
  onActivate: () => void;
  onErase: () => void;
  scopeKey: string;
};

export const SettingsObjectFieldInactiveActionDropdown = ({
  onActivate,
  scopeKey,
}: SettingsObjectFieldInactiveActionDropdownProps) => {
  const dropdownId = `${scopeKey}-settings-field-disabled-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleActivate = () => {
    onActivate();
    closeDropdown();
  };

  // const handleErase = () => {
  //   onErase();
  //   closeDropdown();
  // };

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
              text="Activate"
              LeftIcon={IconArchiveOff}
              onClick={handleActivate}
            />
            {/* {isCustomField && (
                <MenuItem
                  text="Erase"
                  accent="danger"
                  LeftIcon={IconTrash}
                  onClick={handleErase}
                />
              )} */}
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
    />
  );
};
