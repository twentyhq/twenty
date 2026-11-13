import { inboxMessagesLoadingState } from '@/ai/states/inboxMessagesLoadingState';
import { inboxRecentThreadsLoadingSelector } from '@/ai/states/selectors/inboxRecentThreadsLoadingSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const inboxIsLoadingSelector = createAtomSelector<boolean>({
  key: 'inboxIsLoadingSelector',
  get: ({ get }) =>
    get(inboxMessagesLoadingState) || get(inboxRecentThreadsLoadingSelector),
});
