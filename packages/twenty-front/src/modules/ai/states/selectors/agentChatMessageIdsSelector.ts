import { agentChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatMessageIdsSelector = createAtomSelector<string[]>({
  key: 'agentChatMessageIdsSelector',
  get: ({ get }) =>
    get(agentChatDisplayedThreadMessagesSelector).map((message) => message.id),
});
