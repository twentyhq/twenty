import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconDownload,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownRootContent } from '@/ui/layout/dropdown/components/DropdownRootContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { Dropdown, LightIconButton } from 'twenty-ui/components';

type AttachmentDropdownProps = {
  attachmentId: string;
  onDownload: () => void;
  onDelete: () => void;
  onRename: () => void;
  hasDownloadPermission: boolean;
};

export const AttachmentDropdown = ({
  attachmentId,
  onDownload,
  onDelete,
  onRename,
  hasDownloadPermission,
}: AttachmentDropdownProps) => {
  const { t } = useLingui();

  return (
    <DropdownRoot
      dropdownId={`${attachmentId}-attachment-dropdown`}
      type="menu"
    >
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownRootContent
        align="end"
        width={GenericDropdownContentWidth.Narrow}
      >
        <Dropdown.Section>
          {hasDownloadPermission && (
            <Dropdown.ActionItem
              startIcon={<IconDownload />}
              onClick={onDownload}
            >
              {t`Download`}
            </Dropdown.ActionItem>
          )}
          <Dropdown.ActionItem startIcon={<IconPencil />} onClick={onRename}>
            {t`Rename`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={onDelete}
          >
            {t`Delete`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownRootContent>
    </DropdownRoot>
  );
};
