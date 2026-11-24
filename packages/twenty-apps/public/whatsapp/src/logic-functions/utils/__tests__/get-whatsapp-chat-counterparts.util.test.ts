import { describe, expect, it } from 'vitest';

import { getWhatsappChatCounterparts } from 'src/logic-functions/utils/get-whatsapp-chat-counterparts.util';

const GRACE = {
  id: '33622222222@s.whatsapp.net',
  display_name: 'Grace Hopper',
};
const ADA = { id: '33633333333@s.whatsapp.net', display_name: 'Ada Lovelace' };
const ME = { id: '33611111111@s.whatsapp.net', display_name: 'Me' };

describe('getWhatsappChatCounterparts', () => {
  it('returns the other user of a one-to-one chat', () => {
    expect(
      getWhatsappChatCounterparts({
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
      getWhatsappChatCounterparts({
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
