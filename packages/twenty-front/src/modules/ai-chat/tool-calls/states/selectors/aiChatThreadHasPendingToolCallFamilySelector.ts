import { isNonEmptyArray } from 'twenty-shared/utils';

import { aiChatThreadPendingToolCallsFamilySelector } from '@/ai-chat/tool-calls/states/selectors/aiChatThreadPendingToolCallsFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatThreadHasPendingToolCallFamilySelector =
  createAtomFamilySelector<boolean, { threadId: string | null }>({
    key: 'aiChatThreadHasPendingToolCallFamilySelector',
    get:
      ({ threadId }) =>
      ({ get }) =>
        isNonEmptyArray(
          get(aiChatThreadPendingToolCallsFamilySelector, { threadId }),
        ),
  });
