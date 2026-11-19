import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { aiChatMessageAuthorLookupSelector } from '@/ai-chat/messages/states/selectors/aiChatMessageAuthorLookupSelector';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { findAiChatQuotedMessage } from '@/ai-chat/messages/utils/findAiChatQuotedMessage';
import { parseAiChatMessageQuote } from '@/ai-chat/messages/utils/parseAiChatMessageQuote';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatReplyQuotedMessageIdFamilySelector =
  createAtomFamilySelector<
    Nullable<string>,
    { threadId: string; replyMessageId: string }
  >({
    key: 'aiChatReplyQuotedMessageIdFamilySelector',
    get:
      ({ threadId, replyMessageId }) =>
      ({ get }) => {
        const messages = get(aiChatMessagesFamilyState, { threadId });
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
