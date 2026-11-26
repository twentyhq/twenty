import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { isToolsOnlyAiChatMessage } from '@/ai-chat/messages/utils/isToolsOnlyAiChatMessage';
import { useIsStandaloneToolPart } from '@/ai-chat/tool-calls/hooks/useIsStandaloneToolPart';

export const useIsToolsOnlyAiChatMessage = (
  message: ExtendedUIMessage | null | undefined,
): boolean => {
  const isStandaloneToolPart = useIsStandaloneToolPart();

  return (
    isDefined(message) &&
    isToolsOnlyAiChatMessage(message) &&
    !message.parts.some(isStandaloneToolPart)
  );
};
