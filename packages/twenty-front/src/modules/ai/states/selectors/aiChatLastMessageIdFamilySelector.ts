import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatLastMessageIdFamilySelector = createAtomFamilySelector<
  string | null,
  string
>({
  key: 'aiChatLastMessageIdFamilySelector',
  get:
    (threadId) =>
    ({ get }) => {
      const lastMessage = get(aiChatMessagesFamilyState, { threadId }).at(-1);

      if (lastMessage?.role === AGENT_MESSAGE_ROLE.USER) {
        return null;
      }

      return lastMessage?.id ?? null;
    },
});
