import { styled } from '@linaria/react';
import { type MouseEvent, useId } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadActionsDropdown } from '@/ai/components/AiChatThreadActionsDropdown';
import { AiChatThreadActivityTime } from '@/ai/components/AiChatThreadActivityTime';
import { AiChatThreadAvatar } from '@/ai/components/AiChatThreadAvatar';
import { InboxThreadChannelIcon } from '@/inbox/components/InboxThreadChannelIcon';
import { AiChatThreadRow } from '@/ai/components/AiChatThreadRow';
import { AiChatThreadSubtitle } from '@/ai/components/AiChatThreadSubtitle';
import { AiChatThreadTitle } from '@/ai/components/AiChatThreadTitle';
import { useAiChatThreadSubtitleContent } from '@/ai/hooks/useAiChatThreadSubtitleContent';
import { useAiChatThreadDisplayLabel } from '@/ai/hooks/useAiChatThreadDisplayLabel';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { useInboxThreadTriage } from '@/inbox/hooks/useInboxThreadTriage';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { type InboxThreadListVariant } from '@/inbox/types/InboxThreadListVariant';
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
  thread: AiChatThreadRecord;
  variant?: InboxThreadListVariant;
  isSelected: boolean;
  isChecked?: boolean;
  onClick: (
    thread: AiChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onCheckboxClick?: (
    thread: AiChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onContextMenu?: (
    thread: AiChatThreadRecord,
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
  const displayLabel = useAiChatThreadDisplayLabel({
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
  } = useAiChatThreadRename(thread);

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
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId: thread.id },
  );
  const { hasContent: hasSubtitleContent } =
    useAiChatThreadSubtitleContent(thread);
  const isCompact = variant === 'compact';
  const shouldShowMore =
    isDefined(onDetach) ||
    isDefined(thread.deletedAt) ||
    !isDefined(triageStatus) ||
    triageStatus === 'open';

  return (
    <AiChatThreadRow
      variant={variant}
      id={thread.id}
      label={displayLabel}
      isSelected={isSelected}
      isChecked={isChecked}
      isEditing={isRenaming}
      isActionMenuOpen={isDropdownOpen}
      isStreaming={aiChatIsStreaming}
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
        <AiChatThreadAvatar thread={thread} size={isCompact ? 'md' : 'lg'} />
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
          <AiChatThreadTitle thread={thread} />
        )
      }
      activityTime={
        !isRenaming && (
          <StyledActivityTime>
            <InboxThreadChannelIcon thread={thread} />
            <AiChatThreadActivityTime thread={thread} variant={variant} />
          </StyledActivityTime>
        )
      }
      subtitle={
        !isCompact || hasSubtitleContent ? (
          <AiChatThreadSubtitle
            thread={thread}
            size={isCompact ? 'md' : 'sm'}
          />
        ) : undefined
      }
      actions={
        <AiChatThreadActionsDropdown
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
