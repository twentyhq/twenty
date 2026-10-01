import { t } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type AgentChatThreadPreview } from '~/generated-metadata/graphql';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { stripMarkdown } from '~/utils/string/stripMarkdown';

// Members' messages carry who wrote them; agent replies read as plain text,
// as they do in the chat itself
export const getAgentChatThreadPreviewText = ({
  preview,
  workspaceMembers,
  currentWorkspaceMemberId,
}: {
  preview: AgentChatThreadPreview | null;
  workspaceMembers: PartialWorkspaceMember[];
  currentWorkspaceMemberId: string | undefined;
}): string | null => {
  // The server cuts the text short, which can leave half a reference at the end
  const text = stripMarkdown(
    getChatReferenceSegments(preview?.lastMessageText ?? '')
      .map((segment) => (isString(segment) ? segment : segment.displayName))
      .join('')
      .replace(/\[\[[^\]]*$/, ''),
  );

  if (!isNonEmptyString(text)) {
    return null;
  }

  const senderId = preview?.lastMessageSenderWorkspaceMemberId;

  if (!isDefined(senderId)) {
    return text;
  }

  if (senderId === currentWorkspaceMemberId) {
    return t`You: ${text}`;
  }

  const sender = workspaceMembers.find(({ id }) => id === senderId);
  const senderName = !isDefined(sender)
    ? t`Former member`
    : isNonEmptyString(sender.name.firstName)
      ? sender.name.firstName
      : sender.userEmail;

  return t`${senderName}: ${text}`;
};
