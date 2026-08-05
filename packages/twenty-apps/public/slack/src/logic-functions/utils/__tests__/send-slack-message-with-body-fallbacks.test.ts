import { type KnownBlock } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendSlackMessageWithBodyFallbacks } from 'src/logic-functions/utils/send-slack-message-with-body-fallbacks';

const MESSAGE_TEXT = 'hello';
const BLOCKS: KnownBlock[] = [{ type: 'markdown', text: 'hello' }];

const rejectedBody = () =>
  Object.assign(new Error('invalid_blocks'), {
    data: { error: 'invalid_blocks' },
  });

describe('sendSlackMessageWithBodyFallbacks', () => {
  const sendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sendMessage.mockResolvedValue({ success: true, message: 'sent' });
  });

  it('should send the requested body and not retry when it is accepted', async () => {
    const result = await sendSlackMessageWithBodyFallbacks({
      messageText: MESSAGE_TEXT,
      messageBody: { messageBlocks: BLOCKS },
      failureMessage: 'Failed',
      sendMessage,
    });

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      blocks: BLOCKS,
      text: MESSAGE_TEXT,
    });
    expect(result.success).toBe(true);
  });

  it('should fall back from blocks to markdown when blocks are rejected', async () => {
    sendMessage
      .mockRejectedValueOnce(rejectedBody())
      .mockResolvedValueOnce({ success: true, message: 'sent' });

    const result = await sendSlackMessageWithBodyFallbacks({
      messageText: MESSAGE_TEXT,
      messageBody: { messageBlocks: BLOCKS },
      failureMessage: 'Failed',
      sendMessage,
    });

    expect(sendMessage).toHaveBeenNthCalledWith(2, {
      markdown_text: MESSAGE_TEXT,
    });
    expect(result.success).toBe(true);
  });

  it('should fall back all the way to plain text when blocks and markdown are rejected', async () => {
    sendMessage
      .mockRejectedValueOnce(rejectedBody())
      .mockRejectedValueOnce(rejectedBody())
      .mockResolvedValueOnce({ success: true, message: 'sent' });

    const result = await sendSlackMessageWithBodyFallbacks({
      messageText: MESSAGE_TEXT,
      messageBody: { messageBlocks: BLOCKS },
      failureMessage: 'Failed',
      sendMessage,
    });

    expect(sendMessage).toHaveBeenCalledTimes(3);
    expect(sendMessage).toHaveBeenNthCalledWith(3, {
      text: MESSAGE_TEXT,
      mrkdwn: false,
    });
    expect(result.success).toBe(true);
  });

  it('should fall back from markdown to plain text', async () => {
    sendMessage
      .mockRejectedValueOnce(rejectedBody())
      .mockResolvedValueOnce({ success: true, message: 'sent' });

    await sendSlackMessageWithBodyFallbacks({
      messageText: MESSAGE_TEXT,
      messageBody: { messageFormat: 'markdown' },
      failureMessage: 'Failed',
      sendMessage,
    });

    expect(sendMessage).toHaveBeenNthCalledWith(2, {
      text: MESSAGE_TEXT,
      mrkdwn: false,
    });
  });

  it('should not retry a plain text body, which has no simpler form', async () => {
    sendMessage.mockRejectedValue(rejectedBody());

    const result = await sendSlackMessageWithBodyFallbacks({
      messageText: MESSAGE_TEXT,
      messageBody: { messageFormat: 'plain' },
      failureMessage: 'Failed',
      sendMessage,
    });

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
  });

  it('should not retry when the failure is unrelated to the body format', async () => {
    sendMessage.mockRejectedValue(
      Object.assign(new Error('channel_not_found'), {
        data: { error: 'channel_not_found' },
      }),
    );

    const result = await sendSlackMessageWithBodyFallbacks({
      messageText: MESSAGE_TEXT,
      messageBody: { messageBlocks: BLOCKS },
      failureMessage: 'Failed',
      sendMessage,
    });

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      message: 'Failed',
      error: 'channel_not_found',
    });
  });
});
