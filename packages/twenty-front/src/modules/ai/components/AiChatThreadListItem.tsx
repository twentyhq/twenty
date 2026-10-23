import { styled } from '@linaria/react';
import { type MouseEvent, useId } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadActionsDropdown } from '@/ai/components/AiChatThreadActionsDropdown';
import { AiChatThreadActivityTime } from '@/ai/components/AiChatThreadActivityTime';
import { AiChatThreadAvatar } from '@/ai/components/AiChatThreadAvatar';
import { AiChatThreadChannelIcon } from '@/ai/components/AiChatThreadChannelIcon';
import { AiChatThreadRow } from '@/ai/components/AiChatThreadRow';
import { AiChatThreadSubtitle } from '@/ai/components/AiChatThreadSubtitle';
import { AiChatThreadTitle } from '@/ai/components/AiChatThreadTitle';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { useAiChatThreadTriage } from '@/ai/hooks/useAiChatThreadTriage';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { TextInput } from '@/ui/input/components/TextInput';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledActivityTime = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type AiChatThreadListItemProps = {
  thread: AgentChatThreadRecord;
  isSelected: boolean;
  isChecked?: boolean;
  onClick: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onCheckboxClick?: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onContextMenu?: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onDetach?: () => void;
};

export const AiChatThreadListItem = ({
  thread,
  isSelected,
  isChecked = false,
  onClick,
  onCheckboxClick,
  onContextMenu,
  onDetach,
}: AiChatThreadListItemProps) => {
  const { t } = useLingui();
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useAiChatThreadRename(thread);

  const actionsInstanceId = useId();
  const itemMenuDropdownId =
    getCommandMenuDropdownIdFromCommandMenuId(actionsInstanceId);
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    itemMenuDropdownId,
  );
  const { status: triageStatus } = useAiChatThreadTriage(thread.id);
  const shouldShowMore =
    isDefined(onDetach) ||
    isDefined(thread.deletedAt) ||
    !isDefined(triageStatus) ||
    triageStatus === 'open';

  return (
    <AiChatThreadRow
      id={thread.id}
      label={thread.title ?? t`Untitled`}
      isSelected={isSelected}
      isChecked={isChecked}
      isEditing={isRenaming}
      isActionMenuOpen={isDropdownOpen}
      onClick={(event) => onClick(thread, event)}
      onCheckboxClick={
        isDefined(onCheckboxClick)
          ? (event) => onCheckboxClick(thread, event)
          : undefined
      }
      onContextMenu={
        isDefined(onContextMenu)
          ? (event) => onContextMenu(thread, event)
          : undefined
      }
      avatar={<AiChatThreadAvatar thread={thread} />}
      title={
        isRenaming ? (
          <TextInput
            value={draftTitle}
            onChange={setDraftTitle}
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.target.select()}
            onBlur={() => commitRename(draftTitle)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || event.keyCode === 229) {
                return;
              }
              if (event.key === Key.Enter) {
                event.preventDefault();
                void commitRename(draftTitle);
                return;
              }
              if (event.key === Key.Escape) {
                event.preventDefault();
                cancelRename();
              }
            }}
            sizeVariant="sm"
            fullWidth
            autoFocus
            aria-label={t`Rename chat`}
          />
        ) : (
          <AiChatThreadTitle thread={thread} />
        )
      }
      activityTime={
        !isRenaming && (
          <StyledActivityTime>
            <AiChatThreadChannelIcon thread={thread} />
            <AiChatThreadActivityTime thread={thread} />
          </StyledActivityTime>
        )
      }
      subtitle={<AiChatThreadSubtitle thread={thread} />}
      actions={
        <AiChatThreadActionsDropdown
          thread={thread}
          instanceId={actionsInstanceId}
          onRenameRequested={startRename}
          onDetach={onDetach}
          shouldShowTriageActions
          shouldShowMore={shouldShowMore}
        />
      }
    />
  );
};
