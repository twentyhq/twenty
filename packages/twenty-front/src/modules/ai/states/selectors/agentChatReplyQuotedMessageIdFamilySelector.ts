import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { inboxMessageAuthorLookupSelector } from '@/ai/states/selectors/agentChatMessageAuthorLookupSelector';
import { inboxDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { findInboxQuotedMessage } from '@/ai/utils/findAgentChatQuotedMessage';
import { parseInboxMessageQuote } from '@/ai/utils/parseAgentChatMessageQuote';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const inboxReplyQuotedMessageIdFamilySelector = createAtomFamilySelector<
  Nullable<string>,
  { replyMessageId: string }
>({
  key: 'inboxReplyQuotedMessageIdFamilySelector',
  get:
    ({ replyMessageId }) =>
    ({ get }) => {
      const messages = get(inboxDisplayedThreadMessagesSelector);
      const replyText =
        messages
          .find(({ id }) => id === replyMessageId)
          ?.parts.find((part) => part.type === 'text')?.text ?? '';
      const quote = parseInboxMessageQuote(replyText);

      if (!isDefined(quote)) {
        return null;
      }

      return (
        findInboxQuotedMessage({
          messages,
          replyMessageId,
          quote,
          authorLookup: get(inboxMessageAuthorLookupSelector),
        })?.id ?? null
      );
    },
});
