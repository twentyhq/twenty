import { useState } from 'react';

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
    const isSameMessage = snapshot.messageId === messageId;

    setSnapshot({
      messageId,
      isStreaming,
      hasFinishedInView:
        isSameMessage &&
        (snapshot.hasFinishedInView || (snapshot.isStreaming && !isStreaming)),
    });
  }

  return snapshot.messageId === messageId && snapshot.hasFinishedInView;
};
