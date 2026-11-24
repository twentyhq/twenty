import { describe, expect, it } from 'vitest';

import { toggleWhatsappChatSelection } from 'src/front-components/utils/toggle-whatsapp-chat-selection.util';

const PRIYA = { id: 'chat-1', name: 'Priya Nair' };
const GRACE = { id: 'chat-2', name: 'Grace Hopper' };

describe('toggleWhatsappChatSelection', () => {
  it('adds a conversation with its name', () => {
    expect(
      toggleWhatsappChatSelection({ selectedChats: [PRIYA], chats: [GRACE] }),
    ).toEqual([PRIYA, GRACE]);
  });

  it('removes a conversation that was selected', () => {
    expect(
      toggleWhatsappChatSelection({
        selectedChats: [PRIYA, GRACE],
        chats: [{ id: 'chat-1', name: 'Priya' }],
      }),
    ).toEqual([GRACE]);
  });
});
