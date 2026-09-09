import { describe, expect, it } from 'vitest';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { selectSlackConversationMessages } from 'src/logic-functions/utils/select-slack-conversation-messages';

const buildMessages = (count: number): SlackThreadMessage[] =>
  Array.from({ length: count }, (_, index) => ({
    ts: `${index + 1}`,
    user: 'U123',
    text: `message ${index + 1}`,
  }));

describe('selectSlackConversationMessages', () => {
  it('should keep only the most recent turns the agent is shown', () => {
    const selected = selectSlackConversationMessages({
      messages: buildMessages(40),
    });

    expect(selected).toHaveLength(15);
    expect(selected[0].text).toBe('message 26');
    expect(selected[14].text).toBe('message 40');
  });

  it('should exclude the triggering message by timestamp', () => {
    const selected = selectSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: 'Hello' },
        { ts: '2', user: 'U123', text: 'The request itself' },
      ],
      excludeMessageTimestamps: ['2'],
    });

    expect(selected.map((message) => message.ts)).toEqual(['1']);
  });

  it('should keep a file-only message and drop one with neither text nor files', () => {
    const selected = selectSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: '' },
        { ts: '2', user: 'U123', files: [{ id: 'F1', name: 'proposal.pdf' }] },
        { ts: '3', user: 'U123', text: 'a real question' },
      ],
    });

    expect(selected.map((message) => message.ts)).toEqual(['2', '3']);
  });

  it('should trim a file-carrying message that falls outside the window', () => {
    const selected = selectSlackConversationMessages({
      messages: [
        {
          ts: '0',
          user: 'U123',
          files: [{ id: 'F1', name: 'forgotten.pdf' }],
        },
        ...buildMessages(20),
      ],
    });

    expect(selected).toHaveLength(15);
    expect(selected.some((message) => message.files !== undefined)).toBe(false);
  });

  it('should keep bot messages so their files stay covered by the file caveat', () => {
    const selected = selectSlackConversationMessages({
      messages: [
        {
          ts: '1',
          bot_id: 'B_OTHER',
          text: 'Nightly export is ready',
          files: [{ id: 'F1', name: 'export.csv' }],
        },
      ],
    });

    expect(selected.map((message) => message.ts)).toEqual(['1']);
  });
});
