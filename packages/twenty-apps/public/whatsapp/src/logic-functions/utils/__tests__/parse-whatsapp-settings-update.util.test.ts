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

  it('returns nothing to update without a body', () => {
    expect(parseWhatsappSettingsUpdate(undefined)).toEqual({});
  });
});
