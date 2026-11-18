import { isNonEmptyArray } from '@sniptt/guards';

import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatHasMessageFamilySelector = createAtomFamilySelector<
  boolean,
  string
>({
  key: 'aiChatHasMessageFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      isNonEmptyArray(get(aiChatMessagesFamilyState, { threadId })),
});
