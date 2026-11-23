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

  it('keeps the conversations the member selected, each once', () => {
    expect(
      parseWhatsappSettingsUpdate({
        importPolicy: 'SELECTED',
        selectedChatIds: ['chat-1', 'chat-2', 'chat-1'],
      }),
    ).toEqual({
      importPolicy: 'SELECTED',
      selectedChatIds: ['chat-1', 'chat-2'],
    });
  });

  it('keeps an emptied selection', () => {
    expect(parseWhatsappSettingsUpdate({ selectedChatIds: [] })).toEqual({
      selectedChatIds: [],
    });
  });

  it.each([
    ['is not a list', 'chat-1'],
    ['holds something else than conversation ids', ['chat-1', 2]],
    [
      'is larger than a run can import',
      Array.from({ length: 201 }, (_, index) => `chat-${index}`),
    ],
  ])('drops a selection that %s', (_case, selectedChatIds) => {
    expect(parseWhatsappSettingsUpdate({ selectedChatIds })).toEqual({});
  });

  it('returns nothing to update without a body', () => {
    expect(parseWhatsappSettingsUpdate(undefined)).toEqual({});
  });
});
