import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadReasonBadge } from '@/ai/components/AiChatThreadReasonBadge';
import { useIsAgentChatThreadShownAsUnread } from '@/ai/hooks/useIsAgentChatThreadShownAsUnread';
import { agentChatDraftPreviewTextFamilySelector } from '@/ai/states/selectors/agentChatDraftPreviewTextFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadPreviewText } from '@/ai/utils/getAgentChatThreadPreviewText';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledSubtitle = styled.div<{ $isUnread: boolean }>`
  align-items: center;
  color: ${({ $isUnread }) => ($isUnread ? themeCssVariables.font.color.secondary : themeCssVariables.font.color.tertiary)};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  line-height: calc(
    ${themeCssVariables.spacing[4]} - ${themeCssVariables.spacing['0.5']}
  );
  min-height: calc(
    ${themeCssVariables.spacing[4]} - ${themeCssVariables.spacing['0.5']}
  );
  min-width: 0;
`;

const StyledPreview = styled.div`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledAssignee = styled.div`
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
`;

type AiChatThreadSubtitleProps = {
  thread: AgentChatThreadRecord;
};

export const AiChatThreadSubtitle = ({ thread }: AiChatThreadSubtitleProps) => {
  const { t } = useLingui();
  const isUnread = useIsAgentChatThreadShownAsUnread(thread);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const assignee = currentWorkspaceMembers.find(
    (workspaceMember) => workspaceMember.id === thread.assigneeId,
  );
  const assigneeName = isDefined(assignee)
    ? getWorkspaceMemberNameOrEmail(assignee)
    : undefined;
  const isAwaitingAnswer =
    !isDefined(thread.deletedAt) && isDefined(thread.pendingQuestionMessageId);
  const draftPreviewText = useAtomFamilySelectorValue(
    agentChatDraftPreviewTextFamilySelector,
    thread.id,
  );
  const hasDraft = isNonEmptyString(draftPreviewText);
  const previewText = hasDraft
    ? draftPreviewText
    : getAgentChatThreadPreviewText({
        thread,
        workspaceMembers: currentWorkspaceMembers,
        currentWorkspaceMemberId: currentWorkspaceMember?.id,
      });

  return (
    <StyledSubtitle $isUnread={isUnread}>
      {isAwaitingAnswer && (
        <AiChatThreadReasonBadge reason="needsInput" isUnread={isUnread} />
      )}
      {isAwaitingAnswer && hasDraft && <span aria-hidden>·</span>}
      {hasDraft && <AiChatThreadReasonBadge reason="draft" />}
      {(isAwaitingAnswer || hasDraft) && isNonEmptyString(previewText) && (
        <span aria-hidden>·</span>
      )}
      <StyledPreview>{previewText}</StyledPreview>
      {isDefined(assignee) && (
        <StyledAssignee title={t`Assigned to ${assigneeName}`}>
          <Avatar
            src={getAbsoluteImageUrl(assignee.avatarUrl)}
            colorSeed={assignee.id}
            name={assigneeName}
            size="xs"
            shape="circle"
          />
          <VisuallyHidden>{t`, assigned to ${assigneeName}`}</VisuallyHidden>
        </StyledAssignee>
      )}
    </StyledSubtitle>
  );
};
