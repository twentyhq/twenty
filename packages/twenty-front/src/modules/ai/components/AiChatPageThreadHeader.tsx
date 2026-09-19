import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { IconArrowBackUp, IconCheck, IconDotsVertical } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadChannelChip } from '@/ai/components/AiChatThreadChannelChip';
import { AiChatThreadWorkflowRunChip } from '@/ai/components/AiChatThreadWorkflowRunChip';
import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AiChatThreadAssigneeDropdown } from '@/ai/components/AiChatThreadAssigneeDropdown';
import { AiChatThreadParticipants } from '@/ai/components/AiChatThreadParticipants';
import { AiChatThreadSnoozeDropdown } from '@/ai/components/AiChatThreadSnoozeDropdown';
import { useCanWorkAiChatThread } from '@/ai/hooks/useCanWorkAiChatThread';
import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { getAgentChatThreadInboxState } from '@/ai/utils/getAgentChatThreadInboxState';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { useChatThreadInboxActions } from '@/ai/hooks/useChatThreadInboxActions';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  max-width: 100%;
  min-width: 0;
  width: fit-content;
`;

const StyledTitleDisplay = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 24px;
  overflow: hidden;
  padding: 0 5px;

  &:hover,
  &:focus-visible {
    background: ${themeCssVariables.background.transparent.light};
    outline: none;
  }
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: auto;
`;

type AiChatPageThreadHeaderProps = {
  thread: AgentChatThread;
};

export const AiChatPageThreadHeader = ({
  thread,
}: AiChatPageThreadHeaderProps) => {
  const { t } = useLingui();
  const { markChatThreadDone, reopenChatThread } = useChatThreadInboxActions();
  const inboxState = getAgentChatThreadInboxState(thread);
  const isDone = inboxState === AGENT_CHAT_THREAD_INBOX_STATE.DONE;
  const canWorkThread = useCanWorkAiChatThread(thread.id);
  const currentAiChatThreadTitle = useAtomComponentFamilyStateValue(
    currentAiChatThreadTitleComponentFamilyState,
    { threadId: thread.id },
  );
  const title = thread.title ?? currentAiChatThreadTitle;
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useAiChatThreadRename({ ...thread, title });
  const displayTitle = title || t`New chat`;

  return (
    <>
      <StyledTitle>
        {isRenaming ? (
          <TextInput
            value={draftTitle}
            onChange={setDraftTitle}
            onFocus={(event) => event.target.select()}
            onBlur={() => commitRename(draftTitle)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || event.keyCode === 229) {
                return;
              }
              if (event.key === Key.Enter) {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.blur();
              } else if (event.key === Key.Escape) {
                event.preventDefault();
                event.stopPropagation();
                cancelRename();
              }
            }}
            placeholder={t`Chat name`}
            sizeVariant="sm"
            autoGrow
            inheritFontStyles
            autoFocus
          />
        ) : (
          <StyledTitleDisplay
            role="button"
            tabIndex={0}
            aria-label={t`Rename chat`}
            onClick={startRename}
            onKeyDown={(event) => {
              if (event.key === Key.Enter || event.key === ' ') {
                event.preventDefault();
                startRename();
              }
            }}
          >
            <OverflowingTextWithTooltip text={displayTitle} />
          </StyledTitleDisplay>
        )}
      </StyledTitle>
      <AiChatThreadChannelChip
        threadId={thread.id}
        channelId={thread.channelId}
      />
      <AiChatThreadWorkflowRunChip workflowRunId={thread.workflowRunId} />
      <StyledActions>
        <AiChatThreadParticipants threadId={thread.id} />
        {canWorkThread && (
          <>
            <AiChatThreadAssigneeDropdown threadId={thread.id} />
            {!isDone && <AiChatThreadSnoozeDropdown threadId={thread.id} />}
            <IconButton
              size="sm"
              variant="outline"
              aria-label={isDone ? t`Reopen chat` : t`Mark chat done`}
              onClick={() =>
                isDone
                  ? reopenChatThread(thread.id)
                  : markChatThreadDone(thread.id)
              }
            >
              {isDone ? <IconArrowBackUp /> : <IconCheck />}
            </IconButton>
          </>
        )}
        <AiChatThreadItemMenu
          threadId={thread.id}
          threadTitle={displayTitle}
          channelId={thread.channelId}
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.PAGE_HEADER}
          onRenameRequested={startRename}
          clickableComponent={
            <IconButton
              size="sm"
              variant="outline"
              aria-label={t`Chat actions`}
            >
              <IconDotsVertical />
            </IconButton>
          }
        />
      </StyledActions>
    </>
  );
};
