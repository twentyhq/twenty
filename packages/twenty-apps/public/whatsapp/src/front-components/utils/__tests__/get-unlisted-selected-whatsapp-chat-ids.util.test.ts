import { describe, expect, it } from 'vitest';

import { getUnlistedSelectedWhatsappChatIds } from 'src/front-components/utils/get-unlisted-selected-whatsapp-chat-ids.util';

describe('getUnlistedSelectedWhatsappChatIds', () => {
  it('keeps the selected conversations that are in none of the listed ones, so they can still be removed', () => {
    expect(
      getUnlistedSelectedWhatsappChatIds({
        selectedChatIds: ['recent', 'too-old', 'deleted'],
        chats: [{ id: 'recent' }, { id: 'other' }],
      }),
    ).toEqual(['too-old', 'deleted']);
  });

  it('returns nothing when every selected conversation is listed', () => {
    expect(
      getUnlistedSelectedWhatsappChatIds({
        selectedChatIds: ['recent'],
        chats: [{ id: 'recent' }],
      }),
    ).toEqual([]);
  });
});
