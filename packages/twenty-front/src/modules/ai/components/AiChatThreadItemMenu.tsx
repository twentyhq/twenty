import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import {
  IconArchive,
  IconArchiveOff,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';

import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { useChatThreadArchiveActions } from '@/ai/hooks/useChatThreadArchiveActions';
import { aiChatThreadPendingDeleteFamilyState } from '@/ai/states/aiChatThreadPendingDeleteFamilyState';
import { getAiChatThreadDeleteModalId } from '@/ai/utils/getAiChatThreadDeleteModalId';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type AiChatThreadItemMenuProps = {
  threadId: string;
  threadTitle: string;
  isArchived: boolean;
  surface: AiChatThreadActionsSurface;
  onRenameRequested: () => void;
  trigger?: ReactElement;
};

export const AiChatThreadItemMenu = ({
  threadId,
  threadTitle,
  isArchived,
  surface,
  onRenameRequested,
  trigger,
}: AiChatThreadItemMenuProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const { archiveChatThread, unarchiveChatThread } =
    useChatThreadArchiveActions();
  const setAiChatThreadPendingDelete = useSetAtomFamilyState(
    aiChatThreadPendingDeleteFamilyState,
    surface,
  );

  const handleRename = (event: React.MouseEvent) => {
    event.stopPropagation();
    onRenameRequested();
  };

  const handleArchive = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isArchived) {
      await unarchiveChatThread(threadId);
      return;
    }

    await archiveChatThread(threadId);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAiChatThreadPendingDelete({ threadId, threadTitle });
    openDialog(getAiChatThreadDeleteModalId(surface));
  };

  return (
    <DropdownRoot
      dropdownId={getAiChatThreadItemMenuDropdownId({ threadId, surface })}
      type="menu"
    >
      <Dropdown.Trigger
        render={
          trigger ?? (
            <LightIconButton aria-label={t`Chat actions`} emphasis="subtle">
              <IconDotsVertical />
            </LightIconButton>
          )
        }
      />
      <Dropdown.Content align="end" aria-label={t`Chat actions`}>
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconPencil />}
            onClick={handleRename}
          >
            {t`Rename`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={isArchived ? <IconArchiveOff /> : <IconArchive />}
            onClick={handleArchive}
          >
            {isArchived ? t`Unarchive` : t`Archive`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={handleDelete}
          >
            {t`Delete`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </DropdownRoot>
  );
};
