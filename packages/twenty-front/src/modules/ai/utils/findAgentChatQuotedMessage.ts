import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { type InboxMessageAuthorLookup } from '@/ai/types/AgentChatMessageAuthorLookup';
import { type InboxMessageQuote } from '@/ai/types/AgentChatMessageQuote';
import { getInboxMessageAuthor } from '@/ai/utils/getAgentChatMessageAuthor';
import { getInboxMessageQuoteExcerpt } from '@/ai/utils/getAgentChatMessageQuoteExcerpt';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

// a reply does not store the id it quotes, so the original is matched by the quoted text
export const findInboxQuotedMessage = ({
  messages,
  replyMessageId,
  quote,
  authorLookup,
}: {
  messages: ExtendedUIMessage[];
  replyMessageId: string;
  quote: Pick<InboxMessageQuote, 'authorName' | 'excerpt'>;
  authorLookup: InboxMessageAuthorLookup<
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
    if (getInboxMessageQuoteExcerpt(message) !== quote.excerpt) {
      return false;
    }

    const author = getInboxMessageAuthor({ message, authorLookup });

    // a placeholder name (former member, agent not loaded here) cannot be compared
    return !author.isNameResolved || author.name === quote.authorName;
  });
};
