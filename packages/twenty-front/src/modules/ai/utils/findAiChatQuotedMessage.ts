import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { type AiChatMessageAuthorLookup } from '@/ai/types/AiChatMessageAuthorLookup';
import { type AiChatMessageQuote } from '@/ai/types/AiChatMessageQuote';
import { getAiChatMessageAuthor } from '@/ai/utils/getAiChatMessageAuthor';
import { getAiChatMessageQuoteExcerpt } from '@/ai/utils/getAiChatMessageQuoteExcerpt';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

// a reply does not store the id it quotes, so the original is matched by the quoted text
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

    // a placeholder name (former member, agent not loaded here) cannot be compared
    return !author.isNameResolved || author.name === quote.authorName;
  });
};
