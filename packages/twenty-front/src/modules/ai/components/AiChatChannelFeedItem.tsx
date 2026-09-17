import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconArchive, IconSparkles } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { getWorkspaceMemberFullName } from '@/ai/utils/getWorkspaceMemberFullName';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { TextInput } from '@/ui/input/components/TextInput';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AgentChatThread } from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const ASSISTANT_MESSAGE_ROLE = 'assistant';

const StyledFeedItem = styled.div`
  align-items: flex-start;
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
  position: relative;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledThreadIcon = styled.div<{ $isArchived: boolean }>`
  align-items: center;
  background: ${({ $isArchived }) =>
    $isArchived
      ? themeCssVariables.background.transparent.lighter
      : themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ $isArchived }) =>
    $isArchived
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.color.blue};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  margin-top: 2px;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTitleRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  // Leaves room for the menu trigger shown on hover.
  padding-right: ${themeCssVariables.spacing[8]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTime = styled.div`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledPreview = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledAuthor = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledMenuTrigger = styled.div<{ $isDropdownOpen: boolean }>`
  opacity: ${({ $isDropdownOpen }) => ($isDropdownOpen ? 1 : 0)};
  pointer-events: ${({ $isDropdownOpen }) =>
    $isDropdownOpen ? 'auto' : 'none'};
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: ${themeCssVariables.spacing[2]};
  transition: opacity 150ms;

  ${StyledFeedItem}:hover & {
    opacity: 1;
    pointer-events: auto;
  }
`;

type AiChatChannelFeedItemProps = {
  thread: AgentChatThread;
};

export const AiChatChannelFeedItem = ({
  thread,
}: AiChatChannelFeedItemProps) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { handleThreadClick } = useAiChatThreadClick();
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useAiChatThreadRename(thread);

  const isArchived = isDefined(thread.deletedAt);
  const ThreadIcon = isArchived ? IconArchive : IconSparkles;
  const displayTitle = thread.title ?? t`Untitled`;
  const itemMenuDropdownId = getAiChatThreadItemMenuDropdownId({ threadId: thread.id, surface: AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL });
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    itemMenuDropdownId,
  );

  const lastMessageAuthor = currentWorkspaceMembers.find(
    (workspaceMember) =>
      workspaceMember.userWorkspaceId ===
      thread.lastMessageAuthorUserWorkspaceId,
  );
  const authorName =
    thread.lastMessageRole === ASSISTANT_MESSAGE_ROLE
      ? t`AI`
      : isDefined(lastMessageAuthor)
        ? getWorkspaceMemberFullName(lastMessageAuthor)
        : null;
  const lastActivityAt = thread.lastMessageAt ?? thread.updatedAt;

  return (
    <StyledFeedItem
      onClick={() => {
        if (!isRenaming) {
          handleThreadClick(thread);
        }
      }}
    >
      <StyledThreadIcon $isArchived={isArchived}>
        <ThreadIcon size={theme.icon.size.md} color="currentColor" />
      </StyledThreadIcon>
      <StyledContent>
        <StyledTitleRow>
          {isRenaming ? (
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
                } else if (event.key === Key.Escape) {
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
            <StyledTitle>{displayTitle}</StyledTitle>
          )}
          <StyledTime>
            {beautifyPastDateRelativeToNow(lastActivityAt)}
          </StyledTime>
        </StyledTitleRow>
        <StyledPreview>
          {isDefined(thread.lastMessagePreview) ? (
            <>
              {isDefined(authorName) && (
                <StyledAuthor>{authorName}: </StyledAuthor>
              )}
              {thread.lastMessagePreview}
            </>
          ) : (
            t`No message yet`
          )}
        </StyledPreview>
      </StyledContent>
      <StyledMenuTrigger
        $isDropdownOpen={isDropdownOpen}
        onClick={(event) => event.stopPropagation()}
      >
        <AiChatThreadItemMenu
          threadId={thread.id}
          threadTitle={displayTitle}
          channelId={thread.channelId}
          isArchived={isArchived}
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL}
          onRenameRequested={startRename}
        />
      </StyledMenuTrigger>
    </StyledFeedItem>
  );
};
