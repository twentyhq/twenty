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

  it('returns nothing to update without a body', () => {
    expect(parseLinkedinSettingsUpdate(undefined)).toEqual({});
  });
});
