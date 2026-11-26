import { describe, expect, it } from 'vitest';

import { getUnlistedSelectedWhatsappChats } from 'src/front-components/utils/get-unlisted-selected-whatsapp-chats.util';

const RECENT = { id: 'recent', name: 'Priya Nair' };
const TOO_OLD = { id: 'too-old', name: 'Grace Hopper' };
const DELETED = { id: 'deleted', name: 'Q4 hiring' };

describe('getUnlistedSelectedWhatsappChats', () => {
  it('keeps, with their name, the selected conversations that are in none of the listed ones', () => {
    expect(
      getUnlistedSelectedWhatsappChats({
        selectedChats: [RECENT, TOO_OLD, DELETED],
        listedChatIds: ['recent', 'other'],
      }),
    ).toEqual([TOO_OLD, DELETED]);
  });

  it('returns nothing when every selected conversation is listed', () => {
    expect(
      getUnlistedSelectedWhatsappChats({
        selectedChats: [RECENT],
        listedChatIds: ['recent'],
      }),
    ).toEqual([]);
  });
});
