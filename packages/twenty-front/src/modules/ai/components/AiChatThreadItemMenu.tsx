import { useLingui } from '@lingui/react/macro';
import {
  IconArchive,
  IconArchiveOff,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

import { useArchiveChatThread } from '@/ai/hooks/useArchiveChatThread';
import { getAiChatThreadDeleteModalId } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

type AiChatThreadItemMenuProps = {
  threadId: string;
  isArchived: boolean;
  scopeId: string;
  onRenameRequested: () => void;
};

export const getAiChatThreadItemMenuDropdownId = (
  threadId: string,
  scopeId: string,
) => `ai-chat-thread-item-menu-${scopeId}-${threadId}`;

export const AiChatThreadItemMenu = ({
  threadId,
  isArchived,
  scopeId,
  onRenameRequested,
}: AiChatThreadItemMenuProps) => {
  const { t } = useLingui();
  const dropdownId = getAiChatThreadItemMenuDropdownId(threadId, scopeId);
  const { closeDropdown } = useCloseDropdown();
  const { openModal } = useModal();
  const { archiveChatThread, unarchiveChatThread } = useArchiveChatThread();

  const handleRename = (event: React.MouseEvent) => {
    event.stopPropagation();
    closeDropdown(dropdownId);
    onRenameRequested();
  };

  const handleArchive = async (event: React.MouseEvent) => {
    event.stopPropagation();
    closeDropdown(dropdownId);
    if (isArchived) {
      await unarchiveChatThread(threadId);
    } else {
      await archiveChatThread(threadId);
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    closeDropdown(dropdownId);
    openModal(getAiChatThreadDeleteModalId(threadId, scopeId));
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton
          aria-label={t`Chat actions`}
          Icon={IconDotsVertical}
          accent="tertiary"
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItem
              text={t`Rename`}
              LeftIcon={IconPencil}
              onClick={handleRename}
            />
            <MenuItem
              text={isArchived ? t`Unarchive` : t`Archive`}
              LeftIcon={isArchived ? IconArchiveOff : IconArchive}
              onClick={handleArchive}
            />
            <MenuItem
              accent="danger"
              text={t`Delete`}
              LeftIcon={IconTrash}
              onClick={handleDelete}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
