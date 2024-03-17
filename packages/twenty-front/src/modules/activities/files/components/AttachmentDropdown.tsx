import {
  Dropdown,
  DropdownMenu,
  DropdownMenuItemsContainer,
  IconDotsVertical,
  IconDownload,
  IconTrash,
  LightIconButton,
  MenuItem,
  useDropdown,
} from 'twenty-ui';

type AttachmentDropdownProps = {
  onDownload: () => void;
  onDelete: () => void;
  scopeKey: string;
};

export const AttachmentDropdown = ({
  onDownload,
  onDelete,
  scopeKey,
}: AttachmentDropdownProps) => {
  const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleDownload = () => {
    onDownload();
    closeDropdown();
  };

  const handleDelete = () => {
    onDelete();
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
              text="Download"
              LeftIcon={IconDownload}
              onClick={handleDownload}
            />
            <MenuItem
              text="Delete"
              accent="danger"
              LeftIcon={IconTrash}
              onClick={handleDelete}
            />
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
    />
  );
};
