import { getNextAiChatStreamingSnapshot } from '@/ai-chat/messages/utils/getNextAiChatStreamingSnapshot';

const STREAMING = {
  messageId: 'reply',
  isStreaming: true,
  hasFinishedInView: false,
};

describe('getNextAiChatStreamingSnapshot', () => {
  it('records a message that stops streaming while shown', () => {
    expect(
      getNextAiChatStreamingSnapshot(STREAMING, {
        messageId: 'reply',
        isStreaming: false,
      }).hasFinishedInView,
    ).toBe(true);
  });

  it('keeps the record once the message has finished', () => {
    expect(
      getNextAiChatStreamingSnapshot(
        { ...STREAMING, isStreaming: false, hasFinishedInView: true },
        { messageId: 'reply', isStreaming: false },
      ).hasFinishedInView,
    ).toBe(true);
  });

  it('starts over for another message', () => {
    expect(
      getNextAiChatStreamingSnapshot(
        { ...STREAMING, isStreaming: false, hasFinishedInView: true },
        { messageId: 'next-reply', isStreaming: false },
      ).hasFinishedInView,
    ).toBe(false);
  });

  it('ignores a message that was already done when first shown', () => {
    expect(
      getNextAiChatStreamingSnapshot(
        { ...STREAMING, isStreaming: false },
        { messageId: 'reply', isStreaming: false },
      ).hasFinishedInView,
    ).toBe(false);
  });
});
