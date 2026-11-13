import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { type AgentChatMessageAuthor } from '@/ai/types/AgentChatMessageAuthor';
import { getAgentChatMessageQuoteExcerpt } from '@/ai/utils/getAgentChatMessageQuoteExcerpt';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getAgentChatMessageQuoteSource = <
  TWorkspaceMember extends Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail'
  >,
>({
  message,
  author,
}: {
  message: Pick<ExtendedUIMessage, 'id' | 'parts'>;
  author: AgentChatMessageAuthor<TWorkspaceMember>;
}) => ({
  messageId: message.id,
  author,
  excerpt: getAgentChatMessageQuoteExcerpt(message),
});
