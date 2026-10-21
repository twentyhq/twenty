import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatPreviewPlainText } from '@/ai/utils/getAgentChatPreviewPlainText';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

// Members' messages carry who wrote them; agent replies read as plain text,
// as they do in the chat itself
export const getAgentChatThreadPreviewText = ({
  thread,
  workspaceMembers,
  currentWorkspaceMemberId,
}: {
  thread: Pick<
    AgentChatThreadRecord,
    'lastMessageText' | 'lastMessageSenderWorkspaceMemberId'
  >;
  workspaceMembers: PartialWorkspaceMember[];
  currentWorkspaceMemberId: string | undefined;
}): string | null => {
  const text = getAgentChatPreviewPlainText(thread.lastMessageText ?? '');

  if (!isNonEmptyString(text)) {
    return null;
  }

  const senderId = thread.lastMessageSenderWorkspaceMemberId;

  if (!isDefined(senderId)) {
    return text;
  }

  const senderLabel = getAgentChatSenderLabel({
    sender: workspaceMembers.find(({ id }) => id === senderId),
    isCurrentWorkspaceMember: senderId === currentWorkspaceMemberId,
  });

  return t`${senderLabel}: ${text}`;
};
