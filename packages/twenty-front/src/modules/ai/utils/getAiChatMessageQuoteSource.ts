import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { type AiChatMessageAuthor } from '@/ai/types/AiChatMessageAuthor';
import { getAiChatMessageQuoteExcerpt } from '@/ai/utils/getAiChatMessageQuoteExcerpt';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getAiChatMessageQuoteSource = <
  TWorkspaceMember extends Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail'
  >,
>({
  message,
  author,
}: {
  message: Pick<ExtendedUIMessage, 'id' | 'parts'>;
  author: AiChatMessageAuthor<TWorkspaceMember>;
}) => ({
  messageId: message.id,
  author,
  excerpt: getAiChatMessageQuoteExcerpt(message),
});
