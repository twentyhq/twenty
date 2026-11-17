import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { aiChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const aiChatLastMessageIdComponentSelector = createAtomComponentSelector<
  string | null
>({
  key: 'aiChatLastMessageIdComponentSelector',
  componentInstanceContext: AiChatInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const lastMessage = get(aiChatDisplayedThreadMessagesComponentSelector, {
        instanceId,
      }).at(-1);

      if (lastMessage?.role === AGENT_MESSAGE_ROLE.USER) {
        return null;
      }

      return lastMessage?.id ?? null;
    },
});
