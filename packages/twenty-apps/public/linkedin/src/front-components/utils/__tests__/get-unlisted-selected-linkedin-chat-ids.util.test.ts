import { describe, expect, it } from 'vitest';

import { getUnlistedSelectedLinkedinChatIds } from 'src/front-components/utils/get-unlisted-selected-linkedin-chat-ids.util';

describe('getUnlistedSelectedLinkedinChatIds', () => {
  it('keeps the selected conversations that are in none of the listed ones, so they can still be removed', () => {
    expect(
      getUnlistedSelectedLinkedinChatIds({
        selectedChatIds: ['recent', 'too-old', 'deleted'],
        chats: [{ id: 'recent' }, { id: 'other' }],
      }),
    ).toEqual(['too-old', 'deleted']);
  });

  it('returns nothing when every selected conversation is listed', () => {
    expect(
      getUnlistedSelectedLinkedinChatIds({
        selectedChatIds: ['recent'],
        chats: [{ id: 'recent' }],
      }),
    ).toEqual([]);
  });
});
