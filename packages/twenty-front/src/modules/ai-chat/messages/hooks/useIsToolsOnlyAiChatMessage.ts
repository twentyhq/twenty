import {
  type ExtendedUIMessage,
  isToolsOnlyAgentChatMessageParts,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_MESSAGE_ROLE } from '@/ai-chat/messages/constants/AgentMessageRole';
import { useIsStandaloneToolPart } from '@/ai-chat/tool-calls/hooks/useIsStandaloneToolPart';

export const useIsToolsOnlyAiChatMessage = (
  message: ExtendedUIMessage | null | undefined,
): boolean => {
  const isStandaloneToolPart = useIsStandaloneToolPart();

  return (
    isDefined(message) &&
    message.role === AGENT_MESSAGE_ROLE.ASSISTANT &&
    isToolsOnlyAgentChatMessageParts(message.parts) &&
    !message.parts.some(isStandaloneToolPart)
  );
};
