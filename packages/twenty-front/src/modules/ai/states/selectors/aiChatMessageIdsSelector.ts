import { aiChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const aiChatMessageIdsSelector = createAtomSelector<string[]>({
  key: 'aiChatMessageIdsSelector',
  get: ({ get }) =>
    get(aiChatDisplayedThreadMessagesSelector).map((message) => message.id),
});
