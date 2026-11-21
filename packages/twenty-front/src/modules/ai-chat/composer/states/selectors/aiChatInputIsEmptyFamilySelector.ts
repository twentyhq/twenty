import { isNonEmptyString } from '@sniptt/guards';

import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
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
      !isNonEmptyString(get(aiChatComposerDraftsState)[threadId]),
});
