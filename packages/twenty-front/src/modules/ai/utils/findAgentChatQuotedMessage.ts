import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { type AgentChatMessageQuote } from '@/ai/types/AgentChatMessageQuote';
import { getAgentChatMessageQuoteSource } from '@/ai/utils/getAgentChatMessageQuoteSource';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

// a reply does not store the id it quotes, so the original is matched by the quoted text
export const findAgentChatQuotedMessage = ({
  messages,
  replyMessageId,
  quote,
  workspaceMembers,
}: {
  messages: ExtendedUIMessage[];
  replyMessageId: string;
  quote: Pick<AgentChatMessageQuote, 'authorName' | 'excerpt'>;
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'userEmail'>[];
}) => {
  const replyMessageIndex = messages.findIndex(
    ({ id }) => id === replyMessageId,
  );

  if (replyMessageIndex < 0) {
    return undefined;
  }

  return messages.slice(0, replyMessageIndex).findLast((message) => {
    if (message.role !== AGENT_MESSAGE_ROLE.USER) {
      return false;
    }

    const { sender, authorName, excerpt } = getAgentChatMessageQuoteSource({
      message,
      workspaceMembers,
    });

    // a sender who left the workspace no longer resolves to the name the quote was written with
    return (
      excerpt === quote.excerpt &&
      (!isDefined(sender) || authorName === quote.authorName)
    );
  });
};
