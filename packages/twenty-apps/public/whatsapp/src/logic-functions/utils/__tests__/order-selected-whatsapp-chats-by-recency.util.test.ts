import { describe, expect, it } from 'vitest';

import { orderSelectedWhatsappChatsByRecency } from 'src/logic-functions/utils/order-selected-whatsapp-chats-by-recency.util';

const buildChat = (id: string) => ({
  id,
  name: id,
  is_group: false,
  is_1to1: true,
});

describe('orderSelectedWhatsappChatsByRecency', () => {
  it('follows the order of the most recent conversations and leaves the others out', () => {
    expect(
      orderSelectedWhatsappChatsByRecency({
        selectedChats: [
          { id: 'chat-3', name: 'Grace' },
          { id: 'chat-1', name: 'Ada' },
        ],
        recentChats: ['chat-1', 'chat-2', 'chat-3'].map(buildChat),
      }).map(({ id }) => id),
    ).toEqual(['chat-1', 'chat-3']);
  });

  it('keeps the conversations as WhatsApp listed them', () => {
    const recentChat = { ...buildChat('chat-1'), name: 'Ada Lovelace' };

    expect(
      orderSelectedWhatsappChatsByRecency({
        selectedChats: [{ id: 'chat-1', name: 'Ada' }],
        recentChats: [recentChat],
      }),
    ).toEqual([recentChat]);
  });

  it('puts a selected conversation too old to be listed last', () => {
    expect(
      orderSelectedWhatsappChatsByRecency({
        selectedChats: [
          { id: 'chat-old', name: 'Old chat' },
          { id: 'chat-1', name: 'Ada' },
        ],
        recentChats: [buildChat('chat-1')],
      }),
    ).toEqual([
      buildChat('chat-1'),
      { id: 'chat-old', name: 'Old chat', is_group: false, is_1to1: false },
    ]);
  });
});
