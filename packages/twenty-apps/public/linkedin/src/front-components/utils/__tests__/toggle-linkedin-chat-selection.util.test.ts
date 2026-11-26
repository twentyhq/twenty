import { describe, expect, it } from 'vitest';

import { toggleLinkedinChatSelection } from 'src/front-components/utils/toggle-linkedin-chat-selection.util';

const PRIYA = { id: 'chat-1', name: 'Priya Nair' };
const GRACE = { id: 'chat-2', name: 'Grace Hopper' };

describe('toggleLinkedinChatSelection', () => {
  it('adds a conversation with its name', () => {
    expect(
      toggleLinkedinChatSelection({ selectedChats: [PRIYA], chat: GRACE }),
    ).toEqual([PRIYA, GRACE]);
  });

  it('removes a conversation that was selected', () => {
    expect(
      toggleLinkedinChatSelection({
        selectedChats: [PRIYA, GRACE],
        chat: { id: 'chat-1', name: 'Priya' },
      }),
    ).toEqual([GRACE]);
  });
});
