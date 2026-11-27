import { describe, expect, it } from 'vitest';

import { DEFAULT_WHATSAPP_SETTINGS } from 'src/constants/default-whatsapp-settings.constant';
import { hasWhatsappImportSettingChanged } from 'src/logic-functions/utils/has-whatsapp-import-setting-changed.util';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

const hasChanged = (update: Partial<WhatsappSettings>) =>
  hasWhatsappImportSettingChanged({
    previous: DEFAULT_WHATSAPP_SETTINGS,
    next: { ...DEFAULT_WHATSAPP_SETTINGS, ...update },
  });

describe('hasWhatsappImportSettingChanged', () => {
  it.each<Partial<WhatsappSettings>>([
    { importPolicy: 'ALL' },
    { contactAutoCreationPolicy: 'NONE' },
    { selectedChats: [{ id: 'chat-1', name: 'Ada' }] },
  ])('sees %o change what gets imported', (update) => {
    expect(hasChanged(update)).toBe(true);
  });

  it.each<Partial<WhatsappSettings>>([
    {},
    { importPolicy: 'CONTACTS_ONLY' },
    { areChatsMarkedAsRead: true },
  ])('sees %o leave what gets imported as it is', (update) => {
    expect(hasChanged(update)).toBe(false);
  });

  it('ignores the order and the names of the selected conversations', () => {
    expect(
      hasWhatsappImportSettingChanged({
        previous: {
          ...DEFAULT_WHATSAPP_SETTINGS,
          selectedChats: [
            { id: 'chat-1', name: 'Ada' },
            { id: 'chat-2', name: 'Grace' },
          ],
        },
        next: {
          ...DEFAULT_WHATSAPP_SETTINGS,
          selectedChats: [
            { id: 'chat-2', name: 'Grace Hopper' },
            { id: 'chat-1', name: 'Ada' },
          ],
        },
      }),
    ).toBe(false);
  });
});
