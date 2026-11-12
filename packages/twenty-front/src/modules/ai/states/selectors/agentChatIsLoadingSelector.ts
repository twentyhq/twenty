import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatRecentThreadsLoadingSelector } from '@/ai/states/selectors/agentChatRecentThreadsLoadingSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatIsLoadingSelector = createAtomSelector<boolean>({
  key: 'agentChatIsLoadingSelector',
  get: ({ get }) =>
    get(agentChatMessagesLoadingState) ||
    get(agentChatRecentThreadsLoadingSelector),
});
