import { useCallback } from 'react';

import { AI_CHAT_STREAM_CATCHUP_EVENT_NAME } from '@/ai-chat/constants/AiChatStreamCatchupEventName';
import { useAiChatSubscription } from '@/ai-chat/instance/hooks/useAiChatSubscription';
import { type AiChatStreamCatchupEventDetail } from '@/ai-chat/types/AiChatStreamCatchupEventDetail';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';

type AiChatThreadEventStreamEffectProps = {
  threadId: string;
};

export const AiChatThreadEventStreamEffect = ({
  threadId,
}: AiChatThreadEventStreamEffectProps) => {
  const { applyStreamCatchup } = useAiChatSubscription(threadId);

  const handleStreamCatchup = useCallback(
    (detail?: AiChatStreamCatchupEventDetail) => {
      if (detail?.threadId === threadId) {
        applyStreamCatchup(detail.catchup);
      }
    },
    [threadId, applyStreamCatchup],
  );

  useListenToBrowserEvent<AiChatStreamCatchupEventDetail>({
    eventName: AI_CHAT_STREAM_CATCHUP_EVENT_NAME,
    onBrowserEvent: handleStreamCatchup,
  });

  return null;
};
