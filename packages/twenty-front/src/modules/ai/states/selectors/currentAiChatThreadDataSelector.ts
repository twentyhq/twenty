import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const currentAiChatThreadDataSelector = createAtomSelector<
  AgentChatThreadRecord | undefined
>({
  key: 'currentAiChatThreadDataSelector',
  get: ({ get }) => {
    const currentThreadId = get(currentAiChatThreadState);

    return get(agentChatThreadsSelector).find(
      (thread) => thread.id === currentThreadId,
    );
  },
});
