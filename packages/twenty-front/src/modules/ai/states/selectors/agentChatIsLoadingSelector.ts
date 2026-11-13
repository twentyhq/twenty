import { aiChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { inboxRecentThreadsLoadingSelector } from '@/ai/states/selectors/agentChatRecentThreadsLoadingSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const aiChatIsLoadingSelector = createAtomSelector<boolean>({
  key: 'aiChatIsLoadingSelector',
  get: ({ get }) =>
    get(aiChatMessagesLoadingState) || get(inboxRecentThreadsLoadingSelector),
});
