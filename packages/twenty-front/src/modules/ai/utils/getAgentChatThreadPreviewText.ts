import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getInboxPreviewPlainText } from '@/ai/utils/getAgentChatPreviewPlainText';
import { getInboxSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

// Members' messages carry who wrote them; agent replies read as plain text,
// as they do in the chat itself
export const getInboxThreadPreviewText = ({
  thread,
  workspaceMembers,
  currentWorkspaceMemberId,
  assistantDisplayName,
}: {
  thread: Pick<
    InboxThreadRecord,
    'lastMessageText' | 'lastMessageSenderWorkspaceMemberId'
  >;
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'userEmail'>[];
  currentWorkspaceMemberId: string | undefined;
  assistantDisplayName: string;
}): string | null => {
  const text = getInboxPreviewPlainText({
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

  const senderLabel = getInboxSenderLabel({
    sender: workspaceMembers.find(({ id }) => id === senderId),
    isCurrentWorkspaceMember: senderId === currentWorkspaceMemberId,
  });

  return t`${senderLabel}: ${text}`;
};
