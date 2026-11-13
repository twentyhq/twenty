import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getInboxThreadPreviewText } from '@/ai/utils/getAgentChatThreadPreviewText';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getInboxThreadSubtitleContent = ({
  thread,
  draftPreviewText,
  workspaceMembers,
  currentWorkspaceMemberId,
  assistantDisplayName,
}: {
  thread: InboxThreadRecord;
  draftPreviewText: string | null | undefined;
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'userEmail'>[];
  currentWorkspaceMemberId: string | undefined;
  assistantDisplayName: string;
}) => {
  const isAwaitingAnswer =
    !isDefined(thread.deletedAt) && isDefined(thread.pendingQuestionMessageId);
  const hasDraft = isNonEmptyString(draftPreviewText);
  const previewText = hasDraft
    ? draftPreviewText
    : getInboxThreadPreviewText({
        thread,
        workspaceMembers,
        currentWorkspaceMemberId,
        assistantDisplayName,
      });

  return {
    isAwaitingAnswer,
    hasDraft,
    previewText,
    hasContent: isAwaitingAnswer || hasDraft || isNonEmptyString(previewText),
  };
};
