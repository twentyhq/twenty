import { styled } from '@linaria/react';
import { type MouseEvent, useId } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxThreadActionsDropdown } from '@/ai/components/AiChatThreadActionsDropdown';
import { InboxThreadActivityTime } from '@/ai/components/AiChatThreadActivityTime';
import { InboxThreadAvatar } from '@/ai/components/AiChatThreadAvatar';
import { InboxThreadChannelIcon } from '@/ai/components/AiChatThreadChannelIcon';
import { InboxThreadRow } from '@/ai/components/AiChatThreadRow';
import { InboxThreadSubtitle } from '@/ai/components/AiChatThreadSubtitle';
import { InboxThreadTitle } from '@/ai/components/AiChatThreadTitle';
import { useInboxThreadSubtitleContent } from '@/ai/hooks/useAgentChatThreadSubtitleContent';
import { useInboxThreadDisplayLabel } from '@/ai/hooks/useAgentChatThreadDisplayLabel';
import { useInboxThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { useInboxThreadTriage } from '@/ai/hooks/useAiChatThreadTriage';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type InboxThreadListVariant } from '@/ai/types/AiChatThreadListVariant';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { TextInput } from '@/ui/input/components/TextInput';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledActivityTime = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type InboxThreadListItemProps = {
  thread: InboxThreadRecord;
  variant?: InboxThreadListVariant;
  isSelected: boolean;
  isChecked?: boolean;
  onClick: (
    thread: InboxThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onCheckboxClick?: (
    thread: InboxThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onContextMenu?: (
    thread: InboxThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onDetach?: () => void;
};

export const InboxThreadListItem = ({
  thread,
  variant = 'default',
  isSelected,
  isChecked = false,
  onClick,
  onCheckboxClick,
  onContextMenu,
  onDetach,
}: InboxThreadListItemProps) => {
  const { t } = useLingui();
  const displayLabel = useInboxThreadDisplayLabel({
    thread,
    fallbackLabel: t`Untitled`,
  });
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useInboxThreadRename(thread);

  const actionsInstanceId = useId();
  const itemMenuDropdownId =
    getCommandMenuDropdownIdFromCommandMenuId(actionsInstanceId);
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    itemMenuDropdownId,
  );
  const { status: triageStatus } = useInboxThreadTriage({
    threadId: thread.id,
  });
  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: thread.id },
  );
  const { hasContent: hasSubtitleContent } =
    useInboxThreadSubtitleContent(thread);
  const isCompact = variant === 'compact';
  const shouldShowMore =
    isDefined(onDetach) ||
    isDefined(thread.deletedAt) ||
    !isDefined(triageStatus) ||
    triageStatus === 'open';

  return (
    <InboxThreadRow
      variant={variant}
      id={thread.id}
      label={displayLabel}
      isSelected={isSelected}
      isChecked={isChecked}
      isEditing={isRenaming}
      isActionMenuOpen={isDropdownOpen}
      isStreaming={agentChatIsStreaming}
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
      avatar={
        <InboxThreadAvatar thread={thread} size={isCompact ? 'md' : 'lg'} />
      }
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
          <InboxThreadTitle thread={thread} />
        )
      }
      activityTime={
        !isRenaming && (
          <StyledActivityTime>
            <InboxThreadChannelIcon thread={thread} />
            <InboxThreadActivityTime thread={thread} variant={variant} />
          </StyledActivityTime>
        )
      }
      subtitle={
        !isCompact || hasSubtitleContent ? (
          <InboxThreadSubtitle thread={thread} size={isCompact ? 'md' : 'sm'} />
        ) : undefined
      }
      actions={
        <InboxThreadActionsDropdown
          thread={thread}
          instanceId={actionsInstanceId}
          onRenameRequested={startRename}
          onDetach={onDetach}
          shouldShowTriageActions={!isCompact}
          shouldShowMore={shouldShowMore}
        />
      }
    />
  );
};
