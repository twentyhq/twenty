import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const agentChatDisplayedThreadMessagesSelector = createAtomSelector<
  ExtendedUIMessage[]
>({
  key: 'agentChatDisplayedThreadMessagesSelector',
  get: ({ get }) =>
    get(agentChatMessagesFamilyState, {
      threadId: get(agentChatDisplayedThreadState),
    }),
});
