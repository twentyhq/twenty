import { aiChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { aiChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const aiChatDisplayedThreadMessagesSelector = createAtomSelector<
  ExtendedUIMessage[]
>({
  key: 'aiChatDisplayedThreadMessagesSelector',
  get: ({ get }) =>
    get(aiChatMessagesFamilyState, {
      threadId: get(aiChatDisplayedThreadState),
    }),
});
