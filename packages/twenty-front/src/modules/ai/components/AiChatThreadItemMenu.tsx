import { ListItem } from 'twenty-ui/primitives/navigation';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import {
  IconArchive,
  IconArchiveOff,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';

import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { useChatThreadArchiveActions } from '@/ai/hooks/useChatThreadArchiveActions';
import { aiChatThreadPendingDeleteFamilyState } from '@/ai/states/aiChatThreadPendingDeleteFamilyState';
import { getAiChatThreadDeleteModalId } from '@/ai/utils/getAiChatThreadDeleteModalId';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type AiChatThreadItemMenuProps = {
  threadId: string;
  threadTitle: string;
  isArchived: boolean;
  surface: AiChatThreadActionsSurface;
  onRenameRequested: () => void;
  clickableComponent?: ReactNode;
};

export const AiChatThreadItemMenu = ({
  threadId,
  threadTitle,
  isArchived,
  surface,
  onRenameRequested,
  clickableComponent,
}: AiChatThreadItemMenuProps) => {
  const { t } = useLingui();
  const dropdownId = getAiChatThreadItemMenuDropdownId(threadId, surface);
  const { closeDropdown } = useCloseDropdown();
  const { openDialog } = useDialog();
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
    openDialog(getAiChatThreadDeleteModalId(surface));
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      clickableComponent={
        clickableComponent ?? (
          <LightIconButton aria-label={t`Chat actions`} emphasis="subtle">
            <IconDotsVertical />
          </LightIconButton>
        )
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <ListItem
              startIcon={<IconPencil />}
              onClick={handleRename}
            >{t`Rename`}</ListItem>
            <ListItem
              startIcon={isArchived ? <IconArchiveOff /> : <IconArchive />}
              onClick={handleArchive}
            >
              {isArchived ? t`Unarchive` : t`Archive`}
            </ListItem>
            <ListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={handleDelete}
            >{t`Delete`}</ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
