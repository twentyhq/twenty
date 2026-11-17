import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { aiChatMessageAuthorLookupSelector } from '@/ai/states/selectors/aiChatMessageAuthorLookupSelector';
import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { aiChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesComponentSelector';
import { findAiChatQuotedMessage } from '@/ai/utils/findAiChatQuotedMessage';
import { parseAiChatMessageQuote } from '@/ai/utils/parseAiChatMessageQuote';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const aiChatReplyQuotedMessageIdComponentFamilySelector =
  createAtomComponentFamilySelector<
    Nullable<string>,
    { replyMessageId: string }
  >({
    key: 'aiChatReplyQuotedMessageIdComponentFamilySelector',
    componentInstanceContext: AiChatInstanceContext,
    get:
      ({ instanceId, familyKey: { replyMessageId } }) =>
      ({ get }) => {
        const messages = get(aiChatDisplayedThreadMessagesComponentSelector, {
          instanceId,
        });
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
