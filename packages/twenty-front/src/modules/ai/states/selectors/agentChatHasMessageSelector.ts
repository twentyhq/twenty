import { aiChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isNonEmptyArray } from '@sniptt/guards';

export const aiChatHasMessageSelector = createAtomSelector<boolean>({
  key: 'aiChatHasMessageSelector',
  get: ({ get }) => isNonEmptyArray(get(aiChatDisplayedThreadMessagesSelector)),
});
