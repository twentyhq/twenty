import { useCallback } from 'react';

import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai-chat/constants/AiChatSendMessageEventName';
import { AI_CHAT_STOP_EVENT_NAME } from '@/ai-chat/constants/AiChatStopEventName';
import { useAiChat } from '@/ai-chat/hooks/useAiChat';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { type AiChatInstanceEventDetail } from '@/ai-chat/types/AiChatInstanceEventDetail';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';

export const AiChatSendMessageEffect = () => {
  const { instanceId } = useAiChatInstanceOrThrow();
  const { handleSendMessage, handleStop } = useAiChat();

  const handleSendMessageEvent = useCallback(
    (detail?: AiChatInstanceEventDetail) => {
      if (detail?.instanceId === instanceId) {
        void handleSendMessage();
      }
    },
    [instanceId, handleSendMessage],
  );

  const handleStopEvent = useCallback(
    (detail?: AiChatInstanceEventDetail) => {
      if (detail?.instanceId === instanceId) {
        void handleStop();
      }
    },
    [instanceId, handleStop],
  );

  useListenToBrowserEvent<AiChatInstanceEventDetail>({
    eventName: AI_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handleSendMessageEvent,
  });

  useListenToBrowserEvent<AiChatInstanceEventDetail>({
    eventName: AI_CHAT_STOP_EVENT_NAME,
    onBrowserEvent: handleStopEvent,
  });

  return null;
};
