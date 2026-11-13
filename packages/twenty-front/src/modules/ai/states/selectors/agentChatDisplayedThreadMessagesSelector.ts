import { inboxDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { inboxMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const inboxDisplayedThreadMessagesSelector = createAtomSelector<
  ExtendedUIMessage[]
>({
  key: 'inboxDisplayedThreadMessagesSelector',
  get: ({ get }) =>
    get(inboxMessagesFamilyState, {
      threadId: get(inboxDisplayedThreadState),
    }),
});
