import { describe, expect, it } from 'vitest';

import { formatSlackConversationContext } from 'src/logic-functions/utils/format-slack-conversation-context';

const buildMessage = (index: number) => ({
  ts: `1700000000.${String(index).padStart(6, '0')}`,
  user: 'U123',
  text: `message ${index}`,
});

describe('formatSlackConversationContext', () => {
  it('should render each message with its author', () => {
    expect(
      formatSlackConversationContext({
        messages: [buildMessage(1), buildMessage(2)],
      }),
    ).toBe('<@U123>: message 1\n<@U123>: message 2');
  });

  it('should render bot messages as the assistant', () => {
    expect(
      formatSlackConversationContext({
        messages: [{ ts: '1700000000.000001', bot_id: 'B123', text: 'hello' }],
      }),
    ).toBe('assistant: hello');
  });

  it('should keep only the most recent turns of a long thread', () => {
    const messages = Array.from({ length: 120 }, (_, index) =>
      buildMessage(index),
    );

    expect(formatSlackConversationContext({ messages })).toBe(
      Array.from(
        { length: 15 },
        (_, index) => `<@U123>: message ${105 + index}`,
      ).join('\n'),
    );
  });

  it('should exclude the triggering message by timestamp', () => {
    expect(
      formatSlackConversationContext({
        messages: [buildMessage(1), buildMessage(2)],
        excludeMessageTimestamps: ['1700000000.000002'],
      }),
    ).toBe('<@U123>: message 1');
  });

  it('should skip messages without text', () => {
    expect(
      formatSlackConversationContext({
        messages: [{ ts: '1700000000.000001', user: 'U123' }],
      }),
    ).toBe('');
  });
});
