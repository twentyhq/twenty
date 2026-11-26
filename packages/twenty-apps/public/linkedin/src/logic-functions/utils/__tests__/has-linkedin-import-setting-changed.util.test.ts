import { describe, expect, it } from 'vitest';

import { DEFAULT_LINKEDIN_SETTINGS } from 'src/constants/default-linkedin-settings.constant';
import { hasLinkedinImportSettingChanged } from 'src/logic-functions/utils/has-linkedin-import-setting-changed.util';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

const hasChanged = (update: Partial<LinkedinSettings>) =>
  hasLinkedinImportSettingChanged({
    previous: DEFAULT_LINKEDIN_SETTINGS,
    next: { ...DEFAULT_LINKEDIN_SETTINGS, ...update },
  });

describe('hasLinkedinImportSettingChanged', () => {
  it.each<Partial<LinkedinSettings>>([
    { importPolicy: 'CONTACTS_ONLY' },
    { contactAutoCreationPolicy: 'NONE' },
    { isNameMatchingEnabled: false },
    { selectedChats: [{ id: 'chat-1', name: 'Ada' }] },
  ])('sees %o change what gets imported', (update) => {
    expect(hasChanged(update)).toBe(true);
  });

  it.each<Partial<LinkedinSettings>>([
    {},
    { importPolicy: 'ALL' },
    { areChatsMarkedAsRead: true },
  ])('sees %o leave what gets imported as it is', (update) => {
    expect(hasChanged(update)).toBe(false);
  });

  it('ignores the order and the names of the selected conversations', () => {
    expect(
      hasLinkedinImportSettingChanged({
        previous: {
          ...DEFAULT_LINKEDIN_SETTINGS,
          selectedChats: [
            { id: 'chat-1', name: 'Ada' },
            { id: 'chat-2', name: 'Grace' },
          ],
        },
        next: {
          ...DEFAULT_LINKEDIN_SETTINGS,
          selectedChats: [
            { id: 'chat-2', name: 'Grace Hopper' },
            { id: 'chat-1', name: 'Ada' },
          ],
        },
      }),
    ).toBe(false);
  });
});
