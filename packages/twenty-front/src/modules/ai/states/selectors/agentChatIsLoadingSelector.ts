import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatIsLoadingSelector = createAtomSelector<boolean>({
  key: 'agentChatIsLoadingSelector',
  get: ({ get }) =>
    get(agentChatMessagesLoadingState) || get(agentChatThreadsLoadingState),
});
