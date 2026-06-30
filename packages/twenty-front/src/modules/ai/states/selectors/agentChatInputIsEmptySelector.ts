import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isNonEmptyString } from '@sniptt/guards';

export const agentChatInputIsEmptySelector = createAtomSelector<boolean>({
  key: 'agentChatInputIsEmptySelector',
  get: ({ get }) => {
    const agentChatInput = get(agentChatInputState);

    return !isNonEmptyString(agentChatInput);
  },
});
