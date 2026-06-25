import { i18n } from '@lingui/core';
import { STANDARD_COMMAND_MENU_ITEM_IDS } from 'twenty-shared/metadata';

import { localizeStandardCommandMenuItemLabel } from '@/command-menu-item/display/utils/localizeStandardCommandMenuItemLabel';
import { messages as deMessages } from '~/locales/generated/de-DE';
import { messages as enMessages } from '~/locales/generated/en';

const buildCommandMenuItem = (id: string) => ({
  id,
});

describe('localizeStandardCommandMenuItemLabel', () => {
  beforeAll(() => {
    i18n.load('en', enMessages);
    i18n.load('de-DE', deMessages);
  });

  afterEach(() => {
    i18n.activate('en');
  });

  it('should localize dynamic standard record action labels', () => {
    i18n.activate('de-DE');

    expect(
      localizeStandardCommandMenuItemLabel({
        item: buildCommandMenuItem(
          STANDARD_COMMAND_MENU_ITEM_IDS.deleteRecords,
        ),
        label: 'Delete Opportunity',
      }),
    ).toBe('Löschen Opportunity');
  });

  it('should localize standard settings navigation labels', () => {
    i18n.activate('de-DE');

    expect(
      localizeStandardCommandMenuItemLabel({
        item: buildCommandMenuItem(
          STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsAccounts,
        ),
        label: 'Go to Accounts Settings',
      }),
    ).toBe('Zu den Einstellungen gehen - Konten');
  });

  it('should localize standard settings short labels without expanding them', () => {
    i18n.activate('de-DE');

    expect(
      localizeStandardCommandMenuItemLabel({
        item: buildCommandMenuItem(
          STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsAccounts,
        ),
        label: 'Accounts',
      }),
    ).toBe('Konten');
  });

  it('should leave custom command menu item labels unchanged', () => {
    i18n.activate('de-DE');

    expect(
      localizeStandardCommandMenuItemLabel({
        item: buildCommandMenuItem('custom-command-menu-item-id'),
        label: 'Custom Action',
      }),
    ).toBe('Custom Action');
  });
});
