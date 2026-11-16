import { aiChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';

export const aiChatMessageFamilySelector = createAtomFamilySelector<
  Nullable<ExtendedUIMessage>,
  { messageId: Nullable<string> }
>({
  key: 'aiChatMessageFamilySelector',
  get:
    ({ messageId }) =>
    ({ get }) =>
      get(aiChatDisplayedThreadMessagesSelector).find(
        (message) => message.id === messageId,
      ),
});
