import { describe, expect, it } from 'vitest';

import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';

const GRACE = { id: 'ACoGRACE', display_name: 'Grace Hopper' };
const ADA = { id: 'ACoADA', display_name: 'Ada Lovelace' };
const ME = { id: 'ACoME', display_name: 'Me' };

describe('getLinkedinChatCounterparts', () => {
  it('returns the other user of a one-to-one chat', () => {
    expect(
      getLinkedinChatCounterparts({
        id: 'chat-1',
        name: 'Grace Hopper',
        is_group: false,
        is_1to1: true,
        user: GRACE,
      }),
    ).toEqual([GRACE]);
  });

  it('returns the group participants other than the account owner', () => {
    expect(
      getLinkedinChatCounterparts({
        id: 'chat-2',
        name: 'Pioneers',
        is_group: true,
        is_1to1: false,
        participants: [
          { is_self: true, user: ME },
          { is_self: false, user: GRACE },
          { is_self: false, user: ADA },
        ],
      }),
    ).toEqual([GRACE, ADA]);
  });
});
