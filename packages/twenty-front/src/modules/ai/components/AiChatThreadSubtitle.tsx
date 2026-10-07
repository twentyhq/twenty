import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { IconHandClick } from 'twenty-ui/icon';
import { VisibilityHidden } from 'twenty-ui/primitives/accessibility';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useIsAgentChatThreadShownAsUnread } from '@/ai/hooks/useIsAgentChatThreadShownAsUnread';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadPreviewText } from '@/ai/utils/getAgentChatThreadPreviewText';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledSubtitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${themeCssVariables.spacing[4]};
  min-width: 0;
`;

const StyledNeedsInput = styled.div<{ $isUnread: boolean }>`
  align-items: center;
  color: ${({ $isUnread }) =>
    $isUnread
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
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
  const theme = useTheme();
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
  const previewText = getAgentChatThreadPreviewText({
    thread,
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
  });

  return (
    <StyledSubtitle>
      {isAwaitingAnswer && (
        <StyledNeedsInput $isUnread={isUnread}>
          <IconHandClick size={theme.icon.size.sm} />
          {t`Needs input`}
        </StyledNeedsInput>
      )}
      {isAwaitingAnswer && isNonEmptyString(previewText) && (
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
          <VisibilityHidden>{t`, assigned to ${assigneeName}`}</VisibilityHidden>
        </StyledAssignee>
      )}
    </StyledSubtitle>
  );
};
