import { AGENT_MESSAGE_ROLE } from '@/ai-chat/messages/constants/AgentMessageRole';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatIsLastMessageFromUserFamilySelector =
  createAtomFamilySelector<boolean, string>({
    key: 'aiChatIsLastMessageFromUserFamilySelector',
    get:
      (threadId) =>
      ({ get }) =>
        get(aiChatThreadDisplayedMessagesFamilyState, { threadId }).at(-1)
          ?.role === AGENT_MESSAGE_ROLE.USER,
  });
