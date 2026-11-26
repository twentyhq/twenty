import { type AiChatStreamingSnapshot } from '@/ai-chat/messages/types/AiChatStreamingSnapshot';

export const getNextAiChatStreamingSnapshot = ({
  snapshot,
  messageId,
  isStreaming,
}: {
  snapshot: AiChatStreamingSnapshot;
  messageId: string;
  isStreaming: boolean;
}): AiChatStreamingSnapshot => {
  const isSameMessage = snapshot.messageId === messageId;

  return {
    messageId,
    isStreaming,
    hasFinishedInView:
      isSameMessage &&
      (snapshot.hasFinishedInView || (snapshot.isStreaming && !isStreaming)),
  };
};
