import { styled } from '@linaria/react';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
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

const StyledSubtitle = styled.div`
  align-items: center;
  display: flex;
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
`;

type AiChatThreadSubtitleProps = {
  thread: AgentChatThreadRecord;
};

export const AiChatThreadSubtitle = ({ thread }: AiChatThreadSubtitleProps) => {
  const isUnread = useIsAgentChatThreadShownAsUnread(thread);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
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
    <Text
      render={<StyledSubtitle />}
      size="sm"
      color={isUnread ? 'secondary' : 'tertiary'}
    >
      {isAwaitingAnswer && (
        <AiChatThreadReasonBadge reason="needsInput" isUnread={isUnread} />
      )}
      {isAwaitingAnswer && hasDraft && <span aria-hidden>·</span>}
      {hasDraft && <AiChatThreadReasonBadge reason="draft" />}
      {(isAwaitingAnswer || hasDraft) && isNonEmptyString(previewText) && (
        <span aria-hidden>·</span>
      )}
      <Text render={<StyledPreview />} truncate>
        {previewText}
      </Text>
    </Text>
  );
};
