import { inboxDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';

export const inboxMessageFamilySelector = createAtomFamilySelector<
  Nullable<ExtendedUIMessage>,
  { messageId: Nullable<string> }
>({
  key: 'inboxMessageFamilySelector',
  get:
    ({ messageId }) =>
    ({ get }) =>
      get(inboxDisplayedThreadMessagesSelector).find(
        (message) => message.id === messageId,
      ),
});
