import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadPreviewText } from '@/ai/utils/getAgentChatThreadPreviewText';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getAgentChatThreadSubtitleContent = ({
  thread,
  draftPreviewText,
  workspaceMembers,
  currentWorkspaceMemberId,
}: {
  thread: AgentChatThreadRecord;
  draftPreviewText: string | null | undefined;
  workspaceMembers: PartialWorkspaceMember[];
  currentWorkspaceMemberId: string | undefined;
}) => {
  const isAwaitingAnswer =
    !isDefined(thread.deletedAt) && isDefined(thread.pendingQuestionMessageId);
  const hasDraft = isNonEmptyString(draftPreviewText);
  const previewText = hasDraft
    ? draftPreviewText
    : getAgentChatThreadPreviewText({
        thread,
        workspaceMembers,
        currentWorkspaceMemberId,
      });

  return {
    isAwaitingAnswer,
    hasDraft,
    previewText,
    hasContent: isAwaitingAnswer || hasDraft || isNonEmptyString(previewText),
  };
};
