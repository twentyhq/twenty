import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconArchive, IconArchiveOff, IconDotsVertical } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadChannelChip } from '@/ai/components/AiChatThreadChannelChip';
import { AiChatThreadWorkflowRunChip } from '@/ai/components/AiChatThreadWorkflowRunChip';
import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AiChatThreadParticipants } from '@/ai/components/AiChatThreadParticipants';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { useChatThreadArchiveActions } from '@/ai/hooks/useChatThreadArchiveActions';
import { useIsCurrentUserAiChatThreadOwner } from '@/ai/hooks/useIsCurrentUserAiChatThreadOwner';
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
  const { archiveChatThread, unarchiveChatThread } =
    useChatThreadArchiveActions();
  const { isOwner, isKnown: isOwnershipKnown } =
    useIsCurrentUserAiChatThreadOwner(thread.id);
  // Archiving is owner-only on the server, so a member is not offered it.
  const showOwnerActions = !isOwnershipKnown || isOwner;
  const isArchived = isDefined(thread.deletedAt);
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
      <AiChatThreadChannelChip channelId={thread.channelId} />
      <AiChatThreadWorkflowRunChip workflowRunId={thread.workflowRunId} />
      <StyledActions>
        <AiChatThreadParticipants threadId={thread.id} />
        {showOwnerActions && (
          <IconButton
            size="sm"
            variant="outline"
            aria-label={isArchived ? t`Unarchive chat` : t`Archive chat`}
            onClick={() =>
              isArchived
                ? unarchiveChatThread(thread.id)
                : archiveChatThread(thread.id)
            }
          >
            {isArchived ? <IconArchiveOff /> : <IconArchive />}
          </IconButton>
        )}
        <AiChatThreadItemMenu
          threadId={thread.id}
          threadTitle={displayTitle}
          channelId={thread.channelId}
          isArchived={isArchived}
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
