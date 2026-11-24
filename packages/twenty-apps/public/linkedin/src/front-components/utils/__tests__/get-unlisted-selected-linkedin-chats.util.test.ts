import { describe, expect, it } from 'vitest';

import { getUnlistedSelectedLinkedinChats } from 'src/front-components/utils/get-unlisted-selected-linkedin-chats.util';

const RECENT = { id: 'recent', name: 'Priya Nair' };
const TOO_OLD = { id: 'too-old', name: 'Grace Hopper' };
const DELETED = { id: 'deleted', name: 'Q4 hiring' };

describe('getUnlistedSelectedLinkedinChats', () => {
  it('keeps, with their name, the selected conversations that are in none of the listed ones', () => {
    expect(
      getUnlistedSelectedLinkedinChats({
        selectedChats: [RECENT, TOO_OLD, DELETED],
        listedChatIds: ['recent', 'other'],
      }),
    ).toEqual([TOO_OLD, DELETED]);
  });

  it('returns nothing when every selected conversation is listed', () => {
    expect(
      getUnlistedSelectedLinkedinChats({
        selectedChats: [RECENT],
        listedChatIds: ['recent'],
      }),
    ).toEqual([]);
  });
});
