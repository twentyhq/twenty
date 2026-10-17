import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { IconHandClick } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useIsAgentChatThreadShownAsUnread } from '@/ai/hooks/useIsAgentChatThreadShownAsUnread';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadPreviewText } from '@/ai/utils/getAgentChatThreadPreviewText';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
    </StyledSubtitle>
  );
};
