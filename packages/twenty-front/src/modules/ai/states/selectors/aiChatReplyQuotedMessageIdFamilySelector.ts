import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { aiChatMessageAuthorLookupSelector } from '@/ai/states/selectors/aiChatMessageAuthorLookupSelector';
import { aiChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesSelector';
import { findAiChatQuotedMessage } from '@/ai/utils/findAiChatQuotedMessage';
import { parseAiChatMessageQuote } from '@/ai/utils/parseAiChatMessageQuote';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatReplyQuotedMessageIdFamilySelector =
  createAtomFamilySelector<Nullable<string>, { replyMessageId: string }>({
    key: 'aiChatReplyQuotedMessageIdFamilySelector',
    get:
      ({ replyMessageId }) =>
      ({ get }) => {
        const messages = get(aiChatDisplayedThreadMessagesSelector);
        const replyText =
          messages
            .find(({ id }) => id === replyMessageId)
            ?.parts.find((part) => part.type === 'text')?.text ?? '';
        const quote = parseAiChatMessageQuote(replyText);

        if (!isDefined(quote)) {
          return null;
        }

        return (
          findAiChatQuotedMessage({
            messages,
            replyMessageId,
            quote,
            authorLookup: get(aiChatMessageAuthorLookupSelector),
          })?.id ?? null
        );
      },
  });
