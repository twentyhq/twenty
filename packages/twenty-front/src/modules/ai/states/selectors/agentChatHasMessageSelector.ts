import { agentChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isNonEmptyArray } from '@sniptt/guards';

export const agentChatHasMessageSelector = createAtomSelector<boolean>({
  key: 'agentChatHasMessageSelector',
  get: ({ get }) =>
    isNonEmptyArray(get(agentChatDisplayedThreadMessagesSelector)),
});
