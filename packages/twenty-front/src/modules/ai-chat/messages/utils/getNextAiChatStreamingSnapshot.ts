import { type AiChatStreamingSnapshot } from '@/ai-chat/messages/types/AiChatStreamingSnapshot';

export const getNextAiChatStreamingSnapshot = (
  snapshot: AiChatStreamingSnapshot,
  {
    messageId,
    isStreaming,
  }: Pick<AiChatStreamingSnapshot, 'messageId' | 'isStreaming'>,
): AiChatStreamingSnapshot => {
  const isSameMessage = snapshot.messageId === messageId;

  return {
    messageId,
    isStreaming,
    hasFinishedInView:
      isSameMessage &&
      (snapshot.hasFinishedInView || (snapshot.isStreaming && !isStreaming)),
  };
};
