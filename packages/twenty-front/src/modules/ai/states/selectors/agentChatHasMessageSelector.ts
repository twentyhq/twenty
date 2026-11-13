import { inboxDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isNonEmptyArray } from '@sniptt/guards';

export const inboxHasMessageSelector = createAtomSelector<boolean>({
  key: 'inboxHasMessageSelector',
  get: ({ get }) => isNonEmptyArray(get(inboxDisplayedThreadMessagesSelector)),
});
