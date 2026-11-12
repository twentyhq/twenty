import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { type AgentChatMessageAuthorContext } from '@/ai/types/AgentChatMessageAuthorContext';
import { type AgentChatMessageQuote } from '@/ai/types/AgentChatMessageQuote';
import { getAgentChatMessageAuthor } from '@/ai/utils/getAgentChatMessageAuthor';
import { getAgentChatMessageQuoteExcerpt } from '@/ai/utils/getAgentChatMessageQuoteExcerpt';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

// a reply does not store the id it quotes, so the original is matched by the quoted text
export const findAgentChatQuotedMessage = ({
  messages,
  replyMessageId,
  quote,
  authorContext,
}: {
  messages: ExtendedUIMessage[];
  replyMessageId: string;
  quote: Pick<AgentChatMessageQuote, 'authorName' | 'excerpt'>;
  authorContext: AgentChatMessageAuthorContext<
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
    if (getAgentChatMessageQuoteExcerpt(message) !== quote.excerpt) {
      return false;
    }

    const author = getAgentChatMessageAuthor({ message, authorContext });

    // a placeholder name (former member, agent not loaded here) cannot be compared
    return !author.isNameResolved || author.name === quote.authorName;
  });
};
