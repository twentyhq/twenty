import { agentChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';

export const agentChatMessageFamilySelector = createAtomFamilySelector<
  Nullable<ExtendedUIMessage>,
  { messageId: Nullable<string> }
>({
  key: 'agentChatMessageFamilySelector',
  get:
    ({ messageId }) =>
    ({ get }) =>
      get(agentChatDisplayedThreadMessagesSelector).find(
        (message) => message.id === messageId,
      ),
});
