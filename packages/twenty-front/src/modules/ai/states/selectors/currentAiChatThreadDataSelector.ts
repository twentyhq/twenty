import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { inboxRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const currentAiChatThreadDataSelector = createAtomSelector<
  AiChatThreadRecord | undefined
>({
  key: 'currentAiChatThreadDataSelector',
  get: ({ get }) => {
    const currentThreadId = get(currentAiChatThreadState);

    return get(inboxRecentThreadsSelector).find(
      (thread) => thread.id === currentThreadId,
    );
  },
});
