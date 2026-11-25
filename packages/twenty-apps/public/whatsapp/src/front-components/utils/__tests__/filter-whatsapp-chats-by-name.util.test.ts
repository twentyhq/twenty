import { describe, expect, it } from 'vitest';

import { filterWhatsappChatsByName } from 'src/front-components/utils/filter-whatsapp-chats-by-name.util';

const UNLISTED_SELECTED_CHATS = [
  { id: 'chat-1', name: 'Arnaud Charrier' },
  { id: 'chat-2', name: '' },
];

describe('filterWhatsappChatsByName', () => {
  it('keeps every conversation while nothing is searched', () => {
    expect(
      filterWhatsappChatsByName({
        chats: UNLISTED_SELECTED_CHATS,
        search: ' ',
      }),
    ).toEqual(UNLISTED_SELECTED_CHATS);
  });

  it('keeps a selected conversation that is no longer listed when the search matches its stored name', () => {
    expect(
      filterWhatsappChatsByName({
        chats: UNLISTED_SELECTED_CHATS,
        search: 'ARNAUD',
      }),
    ).toEqual([{ id: 'chat-1', name: 'Arnaud Charrier' }]);
  });

  it('hides it when the search does not match its stored name', () => {
    expect(
      filterWhatsappChatsByName({
        chats: UNLISTED_SELECTED_CHATS,
        search: 'pri',
      }),
    ).toEqual([]);
  });
});
