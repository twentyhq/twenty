import { useState } from 'react';

import { getNextAiChatStreamingSnapshot } from '@/ai-chat/messages/utils/getNextAiChatStreamingSnapshot';

export const useHasAiChatMessageFinishedStreamingInView = ({
  messageId,
  isStreaming,
}: {
  messageId: string;
  isStreaming: boolean;
}): boolean => {
  const [snapshot, setSnapshot] = useState({
    messageId,
    isStreaming,
    hasFinishedInView: false,
  });

  if (
    snapshot.messageId !== messageId ||
    snapshot.isStreaming !== isStreaming
  ) {
    setSnapshot(
      getNextAiChatStreamingSnapshot({ snapshot, messageId, isStreaming }),
    );
  }

  return snapshot.messageId === messageId && snapshot.hasFinishedInView;
};
