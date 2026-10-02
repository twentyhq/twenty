import { t } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { stripMarkdown } from '~/utils/string/stripMarkdown';

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
  // The server cuts the text short, which can leave half a reference at the end
  const text = stripMarkdown(
    getChatReferenceSegments(thread.lastMessageText ?? '')
      .map((segment) => (isString(segment) ? segment : segment.displayName))
      .join('')
      .replace(/\[\[[^\]]*$/, ''),
  );

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
