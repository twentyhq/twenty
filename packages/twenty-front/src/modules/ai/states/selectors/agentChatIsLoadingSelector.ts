import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatThreadsLoadingSelector } from '@/ai/states/selectors/agentChatThreadsLoadingSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatIsLoadingSelector = createAtomSelector<boolean>({
  key: 'agentChatIsLoadingSelector',
  get: ({ get }) =>
    get(agentChatMessagesLoadingState) || get(agentChatThreadsLoadingSelector),
});
