import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconSparkles, IconTrash } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadActionsDropdown } from '@/ai/components/AiChatThreadActionsDropdown';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { TextInput } from '@/ui/input/components/TextInput';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { StyledVisuallyHidden } from '@/ui/accessibility/components/StyledVisuallyHidden';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { agentChatThreadPreviewFamilySelector } from '@/ai/states/selectors/agentChatThreadPreviewFamilySelector';
import { formatAgentChatThreadActivityTime } from '@/ai/utils/formatAgentChatThreadActivityTime';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';
import { getAgentChatThreadPreviewText } from '@/ai/utils/getAgentChatThreadPreviewText';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { WorkspaceMemberAvatarStack } from '@/workspace-member/components/WorkspaceMemberAvatarStack';

const StyledThreadItem = styled.div`
  align-items: center;
  border-left: 3px solid transparent;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} 1px;
  position: relative;
  right: 3px;
  transition: all 0.2s ease;
  width: calc(100% + 1px);

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledThreadIcon = styled.div<{ $isDeleted: boolean }>`
  align-items: center;
  background: ${({ $isDeleted }) =>
    $isDeleted
      ? themeCssVariables.background.transparent.lighter
      : themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ $isDeleted }) =>
    $isDeleted
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.color.blue};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledLeading = styled.div`
  display: flex;
  flex-shrink: 0;
  width: ${themeCssVariables.spacing[8]};
`;

const StyledThreadContent = styled.div`
  align-items: baseline;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledThreadTitle = styled.div<{ $isUnread: boolean }>`
  color: ${({ $isUnread }) =>
    $isUnread
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${({ $isUnread }) =>
    $isUnread ? themeCssVariables.font.weight.semiBold : 500};
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledThreadPreview = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActivityTime = styled.div<{ $isDropdownOpen: boolean }>`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  padding-right: ${themeCssVariables.spacing[1]};
  visibility: ${({ $isDropdownOpen }) =>
    $isDropdownOpen ? 'hidden' : 'visible'};

  ${StyledThreadItem}:hover & {
    visibility: hidden;
  }
`;

const StyledMenuTrigger = styled.div<{ $isDropdownOpen: boolean }>`
  opacity: ${({ $isDropdownOpen }) => ($isDropdownOpen ? 1 : 0)};
  pointer-events: ${({ $isDropdownOpen }) =>
    $isDropdownOpen ? 'auto' : 'none'};
  position: absolute;
  right: ${themeCssVariables.spacing[1]};
  top: 50%;
  transform: translateY(-50%);
  transition: opacity 150ms;

  ${StyledThreadItem}:hover & {
    opacity: 1;
    pointer-events: auto;
  }
`;

const THREAD_MEMBERS_MAX_VISIBLE = 2;

type AiChatThreadListItemProps = {
  thread: AgentChatThreadRecord;
  surface?: AiChatThreadActionsSurface;
  onDetach?: () => void;
};

// Keyed per surface; every record page uses RECORD_PAGE, so two record pages on screen share it.
export const AiChatThreadListItem = ({
  thread,
  surface = AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL,
  onDetach,
}: AiChatThreadListItemProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const { handleThreadClick } = useAiChatThreadClick();
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useAiChatThreadRename(thread);

  const isDeleted = isDefined(thread.deletedAt);
  const { isUnread } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    { threadId: thread.id, lastActivityAt: thread.lastActivityAt ?? null },
  );
  const preview = useAtomFamilySelectorValue(
    agentChatThreadPreviewFamilySelector,
    thread.id,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const threadMembers = currentWorkspaceMembers.filter(({ id }) =>
    preview?.memberIds.includes(id),
  );
  const previewText = getAgentChatThreadPreviewText({
    preview,
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
  });
  const ThreadIcon = isDeleted ? IconTrash : IconSparkles;
  const displayTitle = thread.title ?? t`Untitled`;
  const itemMenuDropdownId = getAiChatThreadItemMenuDropdownId({
    threadId: thread.id,
    surface,
  });
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    itemMenuDropdownId,
  );
  return (
    <StyledThreadItem
      onClick={() => {
        if (!isRenaming) {
          handleThreadClick(thread);
        }
      }}
    >
      <StyledLeading>
        {isDeleted || threadMembers.length === 0 ? (
          <StyledThreadIcon $isDeleted={isDeleted}>
            <ThreadIcon size={theme.icon.size.md} color="currentColor" />
          </StyledThreadIcon>
        ) : (
          <WorkspaceMemberAvatarStack
            workspaceMembers={threadMembers}
            defaultAvatarName={t`Member`}
            maxVisible={THREAD_MEMBERS_MAX_VISIBLE}
          />
        )}
      </StyledLeading>
      <StyledThreadContent>
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
          <>
            <StyledThreadTitle $isUnread={!isDeleted && isUnread}>
              {displayTitle}
              {!isDeleted && isUnread && (
                <StyledVisuallyHidden>{t`, unread`}</StyledVisuallyHidden>
              )}
            </StyledThreadTitle>
            {isDefined(previewText) && (
              <StyledThreadPreview>· {previewText}</StyledThreadPreview>
            )}
          </>
        )}
      </StyledThreadContent>
      {!isRenaming && (
        <StyledActivityTime $isDropdownOpen={isDropdownOpen}>
          {formatAgentChatThreadActivityTime(
            getAgentChatThreadLastActivityAt(thread),
          )}
        </StyledActivityTime>
      )}
      <StyledMenuTrigger
        $isDropdownOpen={isDropdownOpen}
        onClick={(event) => event.stopPropagation()}
      >
        <AiChatThreadActionsDropdown
          thread={thread}
          surface={surface}
          onRenameRequested={startRename}
          onDetach={onDetach}
        />
      </StyledMenuTrigger>
    </StyledThreadItem>
  );
};
