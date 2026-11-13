import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const currentAiChatThreadDataSelector = createAtomSelector<
  AgentChatThreadRecord | undefined
>({
  key: 'currentAiChatThreadDataSelector',
  get: ({ get }) => {
    const currentThreadId = get(currentAiChatThreadState);

    return get(agentChatRecentThreadsSelector).find(
      (thread) => thread.id === currentThreadId,
    );
  },
});
