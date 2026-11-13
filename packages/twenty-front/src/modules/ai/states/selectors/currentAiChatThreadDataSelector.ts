import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { inboxRecentThreadsSelector } from '@/inbox/states/selectors/inboxRecentThreadsSelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
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
