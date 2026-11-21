import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AGENT_MESSAGE_ROLE } from '@/ai-chat/messages/constants/AgentMessageRole';

type GroupableAiChatMessage = Pick<ExtendedUIMessage, 'role' | 'metadata'>;

export const areAiChatMessagesGrouped = ({
  previousMessage,
  message,
}: {
  previousMessage: GroupableAiChatMessage;
  message: GroupableAiChatMessage;
}): boolean =>
  previousMessage.role === AGENT_MESSAGE_ROLE.USER &&
  message.role === AGENT_MESSAGE_ROLE.USER &&
  previousMessage.metadata?.senderWorkspaceMemberId ===
    message.metadata?.senderWorkspaceMemberId &&
  previousMessage.metadata?.senderApplicationId ===
    message.metadata?.senderApplicationId;
