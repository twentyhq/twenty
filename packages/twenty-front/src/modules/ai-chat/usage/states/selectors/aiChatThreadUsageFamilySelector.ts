import { isDefined } from 'twenty-shared/utils';

import {
  aiChatThreadUsageFamilyState,
  type AiChatUsageState,
} from '@/ai-chat/usage/states/aiChatThreadUsageFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { getAiChatUsageFromThread } from '@/ai-chat/usage/utils/getAiChatUsageFromThread';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatThreadUsageFamilySelector = createAtomFamilySelector<
  AiChatUsageState | null,
  { threadId: string | null }
>({
  key: 'aiChatThreadUsageFamilySelector',
  get:
    ({ threadId }) =>
    ({ get }) => {
      const liveUsage = get(aiChatThreadUsageFamilyState, { threadId });

      if (isDefined(liveUsage) || !isDefined(threadId)) {
        return liveUsage;
      }

      const thread = get(aiChatThreadRecordFamilySelector, threadId);

      return isDefined(thread) ? getAiChatUsageFromThread(thread) : null;
    },
});
