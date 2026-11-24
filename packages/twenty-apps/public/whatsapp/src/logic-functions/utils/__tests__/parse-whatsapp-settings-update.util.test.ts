import { describe, expect, it } from 'vitest';

import { parseWhatsappSettingsUpdate } from 'src/logic-functions/utils/parse-whatsapp-settings-update.util';

describe('parseWhatsappSettingsUpdate', () => {
  it.each([true, false])(
    'keeps areChatsMarkedAsRead set to %s',
    (areChatsMarkedAsRead) => {
      expect(parseWhatsappSettingsUpdate({ areChatsMarkedAsRead })).toEqual({
        areChatsMarkedAsRead,
      });
    },
  );

  it('drops an areChatsMarkedAsRead that is not a boolean', () => {
    expect(
      parseWhatsappSettingsUpdate({ areChatsMarkedAsRead: 'yes' }),
    ).toEqual({});
  });

  it('keeps the conversations the member selected with their name, each once', () => {
    expect(
      parseWhatsappSettingsUpdate({
        importPolicy: 'SELECTED',
        selectedChats: [
          { id: 'chat-1', name: 'Priya' },
          { id: 'chat-2', name: 'Q4 hiring' },
          { id: 'chat-1', name: 'Priya Nair' },
        ],
      }),
    ).toEqual({
      importPolicy: 'SELECTED',
      selectedChats: [
        { id: 'chat-1', name: 'Priya Nair' },
        { id: 'chat-2', name: 'Q4 hiring' },
      ],
    });
  });

  it('keeps a selected conversation without a name and shortens an endless one', () => {
    expect(
      parseWhatsappSettingsUpdate({
        selectedChats: [
          { id: 'chat-1' },
          { id: 'chat-2', name: 'x'.repeat(300) },
        ],
      }),
    ).toEqual({
      selectedChats: [
        { id: 'chat-1', name: '' },
        { id: 'chat-2', name: 'x'.repeat(200) },
      ],
    });
  });

  it('keeps an emptied selection', () => {
    expect(parseWhatsappSettingsUpdate({ selectedChats: [] })).toEqual({
      selectedChats: [],
    });
  });

  it.each([
    ['is not a list', { id: 'chat-1', name: 'Priya' }],
    ['holds a conversation without an id', [{ name: 'Priya' }]],
    ['holds something else than conversations', ['chat-1']],
    [
      'is larger than a run can import',
      Array.from({ length: 201 }, (_, index) => ({
        id: `chat-${index}`,
        name: '',
      })),
    ],
  ])('drops a selection that %s', (_case, selectedChats) => {
    expect(parseWhatsappSettingsUpdate({ selectedChats })).toEqual({});
  });

  it('returns nothing to update without a body', () => {
    expect(parseWhatsappSettingsUpdate(undefined)).toEqual({});
  });
});
