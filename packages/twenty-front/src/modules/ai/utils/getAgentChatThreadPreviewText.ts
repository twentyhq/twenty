import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAiChatPreviewPlainText } from '@/ai/utils/getAgentChatPreviewPlainText';
import { getAiChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

// Members' messages carry who wrote them; agent replies read as plain text,
// as they do in the chat itself
export const getAiChatThreadPreviewText = ({
  thread,
  workspaceMembers,
  currentWorkspaceMemberId,
  assistantDisplayName,
}: {
  thread: Pick<
    AiChatThreadRecord,
    'lastMessageText' | 'lastMessageSenderWorkspaceMemberId'
  >;
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'userEmail'>[];
  currentWorkspaceMemberId: string | undefined;
  assistantDisplayName: string;
}): string | null => {
  const text = getAiChatPreviewPlainText({
    markdown: thread.lastMessageText ?? '',
    assistantDisplayName,
  });

  if (!isNonEmptyString(text)) {
    return null;
  }

  const senderId = thread.lastMessageSenderWorkspaceMemberId;

  if (!isDefined(senderId)) {
    return text;
  }

  const senderLabel = getAiChatSenderLabel({
    sender: workspaceMembers.find(({ id }) => id === senderId),
    isCurrentWorkspaceMember: senderId === currentWorkspaceMemberId,
  });

  return t`${senderLabel}: ${text}`;
};
