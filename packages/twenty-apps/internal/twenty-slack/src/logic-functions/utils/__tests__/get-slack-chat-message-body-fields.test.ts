import { describe, expect, it } from 'vitest';

import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';

describe('getSlackChatMessageBodyFields', () => {
  it('should send markdown_text when the format is markdown', () => {
    expect(getSlackChatMessageBodyFields('hello', 'markdown')).toEqual({
      markdown_text: 'hello',
    });
  });

  it('should send plain text with mrkdwn disabled when the format is plain', () => {
    expect(getSlackChatMessageBodyFields('hello', 'plain')).toEqual({
      text: 'hello',
      mrkdwn: false,
    });
  });

  it('should fall back to a plain text body when no format is provided', () => {
    expect(getSlackChatMessageBodyFields('hello', undefined)).toEqual({
      text: 'hello',
    });
  });
});
