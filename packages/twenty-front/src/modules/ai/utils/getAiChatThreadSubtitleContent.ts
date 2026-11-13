import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { getAiChatThreadPreviewText } from '@/ai/utils/getAiChatThreadPreviewText';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getAiChatThreadSubtitleContent = ({
  thread,
  draftPreviewText,
  workspaceMembers,
  currentWorkspaceMemberId,
  assistantDisplayName,
}: {
  thread: AiChatThreadRecord;
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
    : getAiChatThreadPreviewText({
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
