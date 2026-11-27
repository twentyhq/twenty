import { isNonEmptyArray } from '@sniptt/guards';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatHasMessageFamilySelector = createAtomFamilySelector<
  boolean,
  string
>({
  key: 'aiChatHasMessageFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      isNonEmptyArray(
        get(aiChatThreadDisplayedMessagesFamilyState, { threadId }),
      ),
});
