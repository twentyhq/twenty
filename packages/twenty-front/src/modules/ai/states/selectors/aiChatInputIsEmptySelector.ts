import { aiChatDraftsByThreadIdState } from '@/ai/states/aiChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isNonEmptyString } from '@sniptt/guards';

// The editor stores an empty draft whenever its text is whitespace only
export const aiChatInputIsEmptySelector = createAtomSelector<boolean>({
  key: 'aiChatInputIsEmptySelector',
  get: ({ get }) => {
    const draftKey =
      get(currentAiChatThreadState) ?? get(newAiChatThreadIdState);

    return !isNonEmptyString(get(aiChatDraftsByThreadIdState)[draftKey]);
  },
});
