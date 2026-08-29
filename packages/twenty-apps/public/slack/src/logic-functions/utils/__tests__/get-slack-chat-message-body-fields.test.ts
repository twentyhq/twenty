import { type KnownBlock } from '@slack/web-api';
import { describe, expect, it } from 'vitest';

import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';

describe('getSlackChatMessageBodyFields', () => {
  it('should send markdown_text when the format is markdown', () => {
    expect(
      getSlackChatMessageBodyFields({
        messageText: 'hello',
        messageFormat: 'markdown',
      }),
    ).toEqual({ markdown_text: 'hello' });
  });

  it('should send plain text with mrkdwn disabled when the format is plain', () => {
    expect(
      getSlackChatMessageBodyFields({
        messageText: 'hello',
        messageFormat: 'plain',
      }),
    ).toEqual({ text: 'hello', mrkdwn: false });
  });

  it('should fall back to a plain text body when no format is provided', () => {
    expect(getSlackChatMessageBodyFields({ messageText: 'hello' })).toEqual({
      text: 'hello',
    });
  });

  it('should send blocks with the message text as notification fallback when blocks are provided', () => {
    const messageBlocks: KnownBlock[] = [{ type: 'markdown', text: 'hello' }];

    expect(
      getSlackChatMessageBodyFields({
        messageText: 'hello',
        messageFormat: 'markdown',
        messageBlocks,
      }),
    ).toEqual({ blocks: messageBlocks, text: 'hello' });
  });

  it('should ignore an empty blocks array and honour the format instead', () => {
    expect(
      getSlackChatMessageBodyFields({
        messageText: 'hello',
        messageFormat: 'markdown',
        messageBlocks: [],
      }),
    ).toEqual({ markdown_text: 'hello' });
  });
});
