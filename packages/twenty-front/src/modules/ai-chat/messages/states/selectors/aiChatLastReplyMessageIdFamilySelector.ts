import { AGENT_MESSAGE_ROLE } from '@/ai-chat/messages/constants/AgentMessageRole';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatLastReplyMessageIdFamilySelector = createAtomFamilySelector<
  string | null,
  string
>({
  key: 'aiChatLastReplyMessageIdFamilySelector',
  get:
    (threadId) =>
    ({ get }) => {
      const lastMessage = get(aiChatThreadDisplayedMessagesFamilyState, {
        threadId,
      }).at(-1);

      if (lastMessage?.role === AGENT_MESSAGE_ROLE.USER) {
        return null;
      }

      return lastMessage?.id ?? null;
    },
});
