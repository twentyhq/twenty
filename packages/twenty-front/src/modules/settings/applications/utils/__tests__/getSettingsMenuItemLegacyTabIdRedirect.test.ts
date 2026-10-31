import { getSettingsMenuItemLegacyTabIdRedirect } from '@/settings/applications/utils/getSettingsMenuItemLegacyTabIdRedirect';

const SLUGGED_SETTINGS_MENU_ITEM = {
  universalIdentifier: '7d48ab00-8e9c-4f3a-9b1e-2c5d6e7f8a90',
  slug: 'sync',
};

const UNSLUGGED_SETTINGS_MENU_ITEM = {
  universalIdentifier: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  slug: null,
};

const SETTINGS_MENU_ITEMS = [
  SLUGGED_SETTINGS_MENU_ITEM,
  UNSLUGGED_SETTINGS_MENU_ITEM,
];

describe('getSettingsMenuItemLegacyTabIdRedirect', () => {
  it('should redirect the universalIdentifier of an item to its slug', () => {
    expect(
      getSettingsMenuItemLegacyTabIdRedirect({
        settingsMenuItems: SETTINGS_MENU_ITEMS,
        hashTabId: SLUGGED_SETTINGS_MENU_ITEM.universalIdentifier,
      }),
    ).toBe('sync');
  });

  it('should not redirect a slug', () => {
    expect(
      getSettingsMenuItemLegacyTabIdRedirect({
        settingsMenuItems: SETTINGS_MENU_ITEMS,
        hashTabId: 'sync',
      }),
    ).toBeUndefined();
  });

  it('should not redirect the universalIdentifier of an item without a slug', () => {
    expect(
      getSettingsMenuItemLegacyTabIdRedirect({
        settingsMenuItems: SETTINGS_MENU_ITEMS,
        hashTabId: UNSLUGGED_SETTINGS_MENU_ITEM.universalIdentifier,
      }),
    ).toBeUndefined();
  });

  it('should not redirect an unrelated or empty hash', () => {
    expect(
      getSettingsMenuItemLegacyTabIdRedirect({
        settingsMenuItems: SETTINGS_MENU_ITEMS,
        hashTabId: 'general',
      }),
    ).toBeUndefined();
    expect(
      getSettingsMenuItemLegacyTabIdRedirect({
        settingsMenuItems: SETTINGS_MENU_ITEMS,
        hashTabId: '',
      }),
    ).toBeUndefined();
  });
});
