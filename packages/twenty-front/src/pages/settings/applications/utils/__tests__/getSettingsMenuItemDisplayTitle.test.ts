import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { getLegacySettingsMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { getSettingsMenuItemDisplayTitle } from '~/pages/settings/applications/utils/getSettingsMenuItemDisplayTitle';

const APPLICATION_UNIVERSAL_IDENTIFIER = '0f5b4d0e-4c6a-4d55-9f1e-2a8f7a3b6c11';
const FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '7c2e9b54-1d3f-4a8e-b6c0-5e9d2f4a7b38';

const LEGACY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  getLegacySettingsMenuItemUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    frontComponentUniversalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  });

const getDisplayTitle = ({
  universalIdentifier,
  title,
}: {
  universalIdentifier: string;
  title: string;
}) =>
  getSettingsMenuItemDisplayTitle({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    frontComponents: [
      {
        id: 'front-component-id',
        universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    ],
    settingsMenuItem: {
      universalIdentifier,
      frontComponentId: 'front-component-id',
      title,
    },
  });

describe('getSettingsMenuItemDisplayTitle', () => {
  beforeEach(() => {
    i18n.load('fr-FR', { [msg`Settings`.id]: 'Paramètres' });
    i18n.activate('fr-FR');
  });

  afterEach(() => {
    i18n.activate(SOURCE_LOCALE);
  });

  it('should translate the title of the synthesized legacy item', () => {
    expect(
      getDisplayTitle({
        universalIdentifier: LEGACY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        title: 'Settings',
      }),
    ).toBe('Paramètres');
  });

  it('should keep the title of an item a developer named Settings', () => {
    expect(
      getDisplayTitle({
        universalIdentifier: 'a4b1c2d3-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        title: 'Settings',
      }),
    ).toBe('Settings');
  });

  it('should keep a title other than the legacy one', () => {
    expect(
      getDisplayTitle({
        universalIdentifier: LEGACY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        title: 'Billing',
      }),
    ).toBe('Billing');
  });
});
