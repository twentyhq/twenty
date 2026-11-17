import { isDefined } from 'twenty-shared/utils';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const currentAiChatThreadDataSelector = createAtomSelector<
  AiChatThreadRecord | undefined
>({
  key: 'currentAiChatThreadDataSelector',
  get: ({ get }) => {
    const currentThreadId = get(currentAiChatThreadState);

    if (!isDefined(currentThreadId)) {
      return undefined;
    }

    const thread = get(aiChatThreadRecordFamilySelector, currentThreadId);

    // A live update or a favorite can store a thread before it is fetched
    return isDefined(thread?.conversationType) ? thread : undefined;
  },
});
