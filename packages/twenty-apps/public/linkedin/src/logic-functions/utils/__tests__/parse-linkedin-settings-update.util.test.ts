import { describe, expect, it } from 'vitest';

import { parseLinkedinSettingsUpdate } from 'src/logic-functions/utils/parse-linkedin-settings-update.util';

describe('parseLinkedinSettingsUpdate', () => {
  it.each([true, false])(
    'keeps areChatsMarkedAsRead set to %s',
    (areChatsMarkedAsRead) => {
      expect(parseLinkedinSettingsUpdate({ areChatsMarkedAsRead })).toEqual({
        areChatsMarkedAsRead,
      });
    },
  );

  it('drops an areChatsMarkedAsRead that is not a boolean', () => {
    expect(
      parseLinkedinSettingsUpdate({ areChatsMarkedAsRead: 'yes' }),
    ).toEqual({});
  });

  it('keeps the conversations the member selected, each once', () => {
    expect(
      parseLinkedinSettingsUpdate({
        importPolicy: 'SELECTED',
        selectedChatIds: ['chat-1', 'chat-2', 'chat-1'],
      }),
    ).toEqual({
      importPolicy: 'SELECTED',
      selectedChatIds: ['chat-1', 'chat-2'],
    });
  });

  it('keeps an emptied selection', () => {
    expect(parseLinkedinSettingsUpdate({ selectedChatIds: [] })).toEqual({
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
    expect(parseLinkedinSettingsUpdate({ selectedChatIds })).toEqual({});
  });

  it('returns nothing to update without a body', () => {
    expect(parseLinkedinSettingsUpdate(undefined)).toEqual({});
  });
});
