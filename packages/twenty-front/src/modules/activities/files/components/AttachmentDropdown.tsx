import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconDownload,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { Menu } from 'twenty-ui/primitives/surfaces';

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
    <DropdownMenu
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <Menu.Group>
            {hasDownloadPermission && (
              <Menu.Item
                startIcon={<IconDownload />}
                onClick={handleDownload}
              >{t`Download`}</Menu.Item>
            )}
            <Menu.Item
              startIcon={<IconPencil />}
              onClick={handleRename}
            >{t`Rename`}</Menu.Item>
            <Menu.Item
              color="danger"
              startIcon={<IconTrash />}
              onClick={handleDelete}
            >{t`Delete`}</Menu.Item>
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
