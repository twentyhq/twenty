import { useCallback } from 'react';

import { useSendAiChatMessage } from '@/ai-chat/composer/hooks/useSendAiChatMessage';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';

export const useAiChat = () => {
  const { instanceId, threadId, onThreadChange } = useAiChatInstanceOrThrow();
  const { sendAiChatMessage } = useSendAiChatMessage();

  const handleSendMessage = useCallback(
    () => sendAiChatMessage({ threadId, instanceId, onThreadChange }),
    [sendAiChatMessage, threadId, instanceId, onThreadChange],
  );

  return { handleSendMessage };
};
