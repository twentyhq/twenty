import { describe, expect, it } from 'vitest';

import { toggleLinkedinChatSelection } from 'src/front-components/utils/toggle-linkedin-chat-selection.util';

const PRIYA = { id: 'chat-1', name: 'Priya Nair' };
const GRACE = { id: 'chat-2', name: 'Grace Hopper' };
const GRACE_INMAIL = { id: 'chat-3', name: 'Grace Hopper' };

describe('toggleLinkedinChatSelection', () => {
  it('adds a conversation with its name', () => {
    expect(
      toggleLinkedinChatSelection({ selectedChats: [PRIYA], chats: [GRACE] }),
    ).toEqual([PRIYA, GRACE]);
  });

  it('removes a conversation that was selected', () => {
    expect(
      toggleLinkedinChatSelection({
        selectedChats: [PRIYA, GRACE],
        chats: [{ id: 'chat-1', name: 'Priya' }],
      }),
    ).toEqual([GRACE]);
  });

  it('adds every conversation with the same person together', () => {
    expect(
      toggleLinkedinChatSelection({
        selectedChats: [PRIYA],
        chats: [GRACE, GRACE_INMAIL],
      }),
    ).toEqual([PRIYA, GRACE, GRACE_INMAIL]);
  });

  it('removes every conversation with the same person when one of them was selected', () => {
    expect(
      toggleLinkedinChatSelection({
        selectedChats: [PRIYA, GRACE_INMAIL],
        chats: [GRACE, GRACE_INMAIL],
      }),
    ).toEqual([PRIYA]);
  });
});
