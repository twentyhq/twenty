import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArchive,
  IconArchiveOff,
  IconDotsVertical,
  IconFolderSymlink,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { MenuItem } from 'twenty-ui/primitives/navigation';

import { AiChatThreadMoveToChannelMenu } from '@/ai/components/AiChatThreadMoveToChannelMenu';
import {
  AI_CHAT_THREAD_ITEM_MENU_PAGE,
  type AiChatThreadItemMenuPage,
} from '@/ai/constants/AiChatThreadItemMenuPage';
import { useIsCurrentUserAiChatThreadOwner } from '@/ai/hooks/useIsCurrentUserAiChatThreadOwner';
import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { useChatThreadArchiveActions } from '@/ai/hooks/useChatThreadArchiveActions';
import { aiChatThreadPendingDeleteFamilyState } from '@/ai/states/aiChatThreadPendingDeleteFamilyState';
import { getAiChatThreadDeleteModalId } from '@/ai/utils/getAiChatThreadDeleteModalId';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type AiChatThreadItemMenuProps = {
  threadId: string;
  threadTitle: string;
  channelId?: string | null;
  isArchived: boolean;
  surface: AiChatThreadActionsSurface;
  onRenameRequested: () => void;
  clickableComponent?: ReactNode;
};

export const AiChatThreadItemMenu = ({
  threadId,
  threadTitle,
  channelId = null,
  isArchived,
  surface,
  onRenameRequested,
  clickableComponent,
}: AiChatThreadItemMenuProps) => {
  const { t } = useLingui();
  const dropdownId = getAiChatThreadItemMenuDropdownId({ threadId: threadId, surface: surface });
  const { closeDropdown } = useCloseDropdown();
  const { openModal } = useModal();
  const [page, setPage] = useState<AiChatThreadItemMenuPage>(
    AI_CHAT_THREAD_ITEM_MENU_PAGE.ROOT,
  );
  const { isOwner, isKnown: isOwnershipKnown } =
    useIsCurrentUserAiChatThreadOwner(threadId);
  // Archive, delete and move are owner-only on the server; hide them once we
  // know the reader is a member rather than showing actions that will fail.
  const showOwnerActions = !isOwnershipKnown || isOwner;
  const goToRoot = () => setPage(AI_CHAT_THREAD_ITEM_MENU_PAGE.ROOT);
  const { archiveChatThread, unarchiveChatThread } =
    useChatThreadArchiveActions();
  const setAiChatThreadPendingDelete = useSetAtomFamilyState(
    aiChatThreadPendingDeleteFamilyState,
    surface,
  );

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
    setAiChatThreadPendingDelete({ threadId, threadTitle });
    openModal(getAiChatThreadDeleteModalId(surface));
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      onClose={goToRoot}
      clickableComponent={
        clickableComponent ?? (
          <LightIconButton
            aria-label={t`Chat actions`}
            Icon={IconDotsVertical}
            accent="tertiary"
          />
        )
      }
      dropdownComponents={
        page === AI_CHAT_THREAD_ITEM_MENU_PAGE.MOVE_TO_CHANNEL ? (
          <AiChatThreadMoveToChannelMenu
            threadId={threadId}
            currentChannelId={channelId}
            dropdownId={dropdownId}
            onBack={goToRoot}
          />
        ) : (
          <DropdownContent>
            <DropdownMenuItemsContainer>
              <MenuItem
                text={t`Rename`}
                LeftIcon={IconPencil}
                onClick={handleRename}
              />
              {showOwnerActions && (
                <MenuItem
                  text={
                    isDefined(channelId)
                      ? t`Move to channel`
                      : t`Add to channel`
                  }
                  LeftIcon={IconFolderSymlink}
                  hasSubMenu
                  onClick={(event) => {
                    event.stopPropagation();
                    setPage(AI_CHAT_THREAD_ITEM_MENU_PAGE.MOVE_TO_CHANNEL);
                  }}
                />
              )}
              {showOwnerActions && (
                <MenuItem
                  text={isArchived ? t`Unarchive` : t`Archive`}
                  LeftIcon={isArchived ? IconArchiveOff : IconArchive}
                  onClick={handleArchive}
                />
              )}
              {showOwnerActions && (
                <MenuItem
                  accent="danger"
                  text={t`Delete`}
                  LeftIcon={IconTrash}
                  onClick={handleDelete}
                />
              )}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        )
      }
    />
  );
};
