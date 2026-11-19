import { isNonEmptyString } from '@sniptt/guards';

import { aiChatDraftsByThreadIdState } from '@/ai-chat/states/aiChatDraftsByThreadIdState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

// The editor stores an empty draft whenever its text is whitespace only
export const aiChatInputIsEmptyFamilySelector = createAtomFamilySelector<
  boolean,
  string
>({
  key: 'aiChatInputIsEmptyFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      !isNonEmptyString(get(aiChatDraftsByThreadIdState)[threadId]),
});
