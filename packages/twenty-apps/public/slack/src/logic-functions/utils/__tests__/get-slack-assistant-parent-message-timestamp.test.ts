import { describe, expect, it } from 'vitest';

import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';

describe('getSlackAssistantParentMessageTimestamp', () => {
  it('should reply into the existing thread when one exists', () => {
    expect(
      getSlackAssistantParentMessageTimestamp({
        slackThreadTimestamp: '1700000000.000001',
        slackMessageTimestamp: '1700000000.000200',
      }),
    ).toBe('1700000000.000001');
  });

  it('should start a thread on the message when there is none', () => {
    expect(
      getSlackAssistantParentMessageTimestamp({
        slackThreadTimestamp: undefined,
        slackMessageTimestamp: '1700000000.000200',
      }),
    ).toBe('1700000000.000200');
  });

  it('should treat an empty thread timestamp as absent', () => {
    expect(
      getSlackAssistantParentMessageTimestamp({
        slackThreadTimestamp: '',
        slackMessageTimestamp: '1700000000.000200',
      }),
    ).toBe('1700000000.000200');
  });
});
