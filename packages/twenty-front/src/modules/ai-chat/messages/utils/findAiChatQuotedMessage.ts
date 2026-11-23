import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { type AiChatMessageAuthorLookup } from '@/ai-chat/messages/types/AiChatMessageAuthorLookup';
import { type AiChatMessageQuote } from '@/ai-chat/messages/types/AiChatMessageQuote';
import { getAiChatMessageAuthor } from '@/ai-chat/messages/utils/getAiChatMessageAuthor';
import { getAiChatMessageQuoteExcerpt } from '@/ai-chat/messages/utils/getAiChatMessageQuoteExcerpt';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const findAiChatQuotedMessage = ({
  messages,
  replyMessageId,
  quote,
  authorLookup,
}: {
  messages: ExtendedUIMessage[];
  replyMessageId: string;
  quote: Pick<AiChatMessageQuote, 'authorName' | 'excerpt'>;
  authorLookup: AiChatMessageAuthorLookup<
    Pick<PartialWorkspaceMember, 'id' | 'name' | 'userEmail'>
  >;
}) => {
  const replyMessageIndex = messages.findIndex(
    ({ id }) => id === replyMessageId,
  );

  if (replyMessageIndex < 0) {
    return undefined;
  }

  return messages.slice(0, replyMessageIndex).findLast((message) => {
    if (getAiChatMessageQuoteExcerpt(message) !== quote.excerpt) {
      return false;
    }

    const author = getAiChatMessageAuthor({ message, authorLookup });

    return !author.isNameResolved || author.name === quote.authorName;
  });
};
