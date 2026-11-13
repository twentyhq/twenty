import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { type InboxMessageAuthor } from '@/ai/types/InboxMessageAuthor';
import { getInboxMessageQuoteExcerpt } from '@/ai/utils/getInboxMessageQuoteExcerpt';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getInboxMessageQuoteSource = <
  TWorkspaceMember extends Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail'
  >,
>({
  message,
  author,
}: {
  message: Pick<ExtendedUIMessage, 'id' | 'parts'>;
  author: InboxMessageAuthor<TWorkspaceMember>;
}) => ({
  messageId: message.id,
  author,
  excerpt: getInboxMessageQuoteExcerpt(message),
});
