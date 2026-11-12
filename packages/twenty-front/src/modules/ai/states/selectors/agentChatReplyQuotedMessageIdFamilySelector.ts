import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { agentChatMessageAuthorContextSelector } from '@/ai/states/selectors/agentChatMessageAuthorContextSelector';
import { agentChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { findAgentChatQuotedMessage } from '@/ai/utils/findAgentChatQuotedMessage';
import { parseAgentChatMessageQuote } from '@/ai/utils/parseAgentChatMessageQuote';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const agentChatReplyQuotedMessageIdFamilySelector =
  createAtomFamilySelector<Nullable<string>, { replyMessageId: string }>({
    key: 'agentChatReplyQuotedMessageIdFamilySelector',
    get:
      ({ replyMessageId }) =>
      ({ get }) => {
        const messages = get(agentChatDisplayedThreadMessagesSelector);
        const replyText =
          messages
            .find(({ id }) => id === replyMessageId)
            ?.parts.find((part) => part.type === 'text')?.text ?? '';
        const quote = parseAgentChatMessageQuote(replyText);

        if (!isDefined(quote)) {
          return null;
        }

        return (
          findAgentChatQuotedMessage({
            messages,
            replyMessageId,
            quote,
            authorContext: get(agentChatMessageAuthorContextSelector),
          })?.id ?? null
        );
      },
  });
