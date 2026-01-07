import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconDownload,
  IconPencil,
  IconTrash,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type AttachmentDropdownProps = {
  onDownload: () => void;
  onDelete: () => void;
  onRename: () => void;
  attachmentId: string;
  hasDownloadPermission: boolean;
};

export const AttachmentDropdown = ({
  onDownload,
  onDelete,
  onRename,
  attachmentId,
  hasDownloadPermission,
}: AttachmentDropdownProps) => {
  const { t } = useLingui();
  const dropdownId = `${attachmentId}-attachment-dropdown`;

  const { closeDropdown } = useCloseDropdown();

  const handleDownload = () => {
    onDownload();
    closeDropdown(dropdownId);
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown(dropdownId);
  };

  const handleRename = () => {
    onRename();
    closeDropdown(dropdownId);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            {hasDownloadPermission && (
              <MenuItem
                text={t`Download`}
                LeftIcon={IconDownload}
                onClick={handleDownload}
              />
            )}
            <MenuItem
              text={t`Rename`}
              LeftIcon={IconPencil}
              onClick={handleRename}
            />
            <MenuItem
              text={t`Delete`}
              accent="danger"
              LeftIcon={IconTrash}
              onClick={handleDelete}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
