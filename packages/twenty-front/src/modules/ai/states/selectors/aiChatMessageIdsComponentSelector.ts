import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { aiChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const aiChatMessageIdsComponentSelector = createAtomComponentSelector<
  string[]
>({
  key: 'aiChatMessageIdsComponentSelector',
  componentInstanceContext: AiChatInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) =>
      get(aiChatDisplayedThreadMessagesComponentSelector, { instanceId }).map(
        (message) => message.id,
      ),
});
