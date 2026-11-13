import { describe, expect, it } from 'vitest';

import { getLinkedinChatReadState } from 'src/logic-functions/utils/get-linkedin-chat-read-state.util';

describe('getLinkedinChatReadState', () => {
  it('reads a chat with no unread message as read', () => {
    expect(getLinkedinChatReadState({ unread_count: 0 })).toBe(true);
  });

  it('reads a chat with unread messages as unread', () => {
    expect(getLinkedinChatReadState({ unread_count: 3 })).toBe(false);
  });

  it('reads a chat manually marked unread as unread', () => {
    expect(getLinkedinChatReadState({ unread_count: -1 })).toBe(false);
  });

  it('returns nothing when Unipile does not report the unread count', () => {
    expect(getLinkedinChatReadState({})).toBeUndefined();
  });
});
