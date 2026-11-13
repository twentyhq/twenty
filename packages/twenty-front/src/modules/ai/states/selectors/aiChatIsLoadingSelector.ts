import { aiChatMessagesLoadingState } from '@/ai/states/aiChatMessagesLoadingState';
import { inboxRecentThreadsLoadingSelector } from '@/inbox/states/selectors/inboxRecentThreadsLoadingSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const aiChatIsLoadingSelector = createAtomSelector<boolean>({
  key: 'aiChatIsLoadingSelector',
  get: ({ get }) =>
    get(aiChatMessagesLoadingState) || get(inboxRecentThreadsLoadingSelector),
});
