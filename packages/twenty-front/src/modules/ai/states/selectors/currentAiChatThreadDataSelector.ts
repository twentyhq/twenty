import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { inboxRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const currentInboxThreadDataSelector = createAtomSelector<
  InboxThreadRecord | undefined
>({
  key: 'currentInboxThreadDataSelector',
  get: ({ get }) => {
    const currentThreadId = get(currentInboxThreadState);

    return get(inboxRecentThreadsSelector).find(
      (thread) => thread.id === currentThreadId,
    );
  },
});
