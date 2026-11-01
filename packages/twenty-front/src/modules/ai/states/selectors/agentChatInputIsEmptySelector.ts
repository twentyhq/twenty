import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isNonEmptyString } from '@sniptt/guards';

// The editor stores an empty draft whenever its text is whitespace only
export const agentChatInputIsEmptySelector = createAtomSelector<boolean>({
  key: 'agentChatInputIsEmptySelector',
  get: ({ get }) => {
    const draftKey =
      get(currentAiChatThreadState) ?? get(newAiChatThreadIdState);

    return !isNonEmptyString(get(agentChatDraftsByThreadIdState)[draftKey]);
  },
});
