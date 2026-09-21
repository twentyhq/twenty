import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
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
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer>
            {hasDownloadPermission && (
              <ListItem
                startIcon={<IconDownload />}
                onClick={getDropdownMenuItemClickHandler(handleDownload)}
              >
                <OverflowingTextWithTooltip text={t`Download`} />
              </ListItem>
            )}
            <ListItem
              startIcon={<IconPencil />}
              onClick={getDropdownMenuItemClickHandler(handleRename)}
            >
              <OverflowingTextWithTooltip text={t`Rename`} />
            </ListItem>
            <ListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={getDropdownMenuItemClickHandler(handleDelete)}
            >
              <OverflowingTextWithTooltip text={t`Delete`} />
            </ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
