import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { getAgentChatMessageQuoteExcerpt } from '@/ai/utils/getAgentChatMessageQuoteExcerpt';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getAgentChatMessageQuoteSource = <
  TWorkspaceMember extends Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail'
  >,
>({
  message,
  workspaceMembers,
}: {
  message: Pick<ExtendedUIMessage, 'parts' | 'metadata'>;
  workspaceMembers: TWorkspaceMember[];
}) => {
  const sender = workspaceMembers.find(
    ({ id }) => id === message.metadata?.senderWorkspaceMemberId,
  );

  return {
    sender,
    authorName: getAgentChatSenderLabel({
      sender,
      isCurrentWorkspaceMember: false,
    }),
    excerpt: getAgentChatMessageQuoteExcerpt(message),
  };
};
