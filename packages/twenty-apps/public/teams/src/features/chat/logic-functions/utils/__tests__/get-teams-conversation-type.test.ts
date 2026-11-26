import { describe, expect, it } from 'vitest';

import { getTeamsConversationType } from 'src/features/chat/logic-functions/utils/get-teams-conversation-type';

describe('getTeamsConversationType', () => {
  it('should return the conversation type Teams sent', () => {
    expect(
      getTeamsConversationType({
        conversation: { conversationType: 'channel' },
      }),
    ).toBe('channel');
  });

  it.each([{}, { conversation: {} }])(
    'should treat a conversation without a type as a personal chat',
    (activity) => {
      expect(getTeamsConversationType(activity)).toBe('personal');
    },
  );
});
