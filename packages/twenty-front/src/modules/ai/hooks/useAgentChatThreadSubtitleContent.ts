import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { agentChatDraftPreviewTextFamilySelector } from '@/ai/states/selectors/agentChatDraftPreviewTextFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadPreviewText } from '@/ai/utils/getAgentChatThreadPreviewText';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatThreadSubtitleContent = (
  thread: AgentChatThreadRecord,
) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const draftPreviewText = useAtomFamilySelectorValue(
    agentChatDraftPreviewTextFamilySelector,
    thread.id,
  );

  const isAwaitingAnswer =
    !isDefined(thread.deletedAt) && isDefined(thread.pendingQuestionMessageId);
  const hasDraft = isNonEmptyString(draftPreviewText);
  const previewText = hasDraft
    ? draftPreviewText
    : getAgentChatThreadPreviewText({
        thread,
        workspaceMembers: currentWorkspaceMembers,
        currentWorkspaceMemberId: currentWorkspaceMember?.id,
      });

  return {
    isAwaitingAnswer,
    hasDraft,
    previewText,
    hasContent: isAwaitingAnswer || hasDraft || isNonEmptyString(previewText),
  };
};
