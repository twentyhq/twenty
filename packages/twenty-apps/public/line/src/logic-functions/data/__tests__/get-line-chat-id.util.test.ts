import { describe, expect, it } from 'vitest';

import { getLineChatId } from 'src/logic-functions/data/get-line-chat-id.util';

describe('getLineChatId', () => {
  it('addresses a one-on-one chat by the user', () => {
    expect(getLineChatId({ type: 'user', userId: 'U1' })).toBe('U1');
  });

  it('addresses a group chat by the group, whoever wrote', () => {
    expect(getLineChatId({ type: 'group', groupId: 'C1', userId: 'U1' })).toBe(
      'C1',
    );
  });

  it('addresses a multi-person chat by the room', () => {
    expect(getLineChatId({ type: 'room', roomId: 'R1' })).toBe('R1');
  });
});
