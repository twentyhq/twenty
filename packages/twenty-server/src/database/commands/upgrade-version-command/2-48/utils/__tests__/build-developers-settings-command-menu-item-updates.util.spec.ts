import { buildDevelopersSettingsCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-48/utils/build-developers-settings-command-menu-item-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-10-14T00:00:00.000Z';

const { universalIdentifier: DEVELOPERS_SETTINGS_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsApiWebhooks;

const MCP_AND_APIS_VALUES = {
  label: 'Go to MCP & APIs Settings',
  shortLabel: 'MCP & APIs',
  icon: 'IconPlug',
  payload: { path: '/settings/api-webhooks' },
};

const DEVELOPERS_VALUES = {
  label: 'Go to Developers Settings',
  shortLabel: 'Developers',
  icon: 'IconCode',
  payload: { path: '/settings/developers' },
};

const buildExistingItems = (
  values: Partial<FlatCommandMenuItem>,
): Record<string, FlatCommandMenuItem> => ({
  [DEVELOPERS_SETTINGS_UNIVERSAL_IDENTIFIER]: {
    universalIdentifier: DEVELOPERS_SETTINGS_UNIVERSAL_IDENTIFIER,
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...values,
  } as FlatCommandMenuItem,
});

describe('buildDevelopersSettingsCommandMenuItemUpdates', () => {
  it('points the former standard item to the Developers settings page', () => {
    const updates = buildDevelopersSettingsCommandMenuItemUpdates({
      flatCommandMenuItemByUniversalIdentifier:
        buildExistingItems(MCP_AND_APIS_VALUES),
      now: NOW,
      direction: 'up',
    });

    expect(updates).toEqual([
      expect.objectContaining({ ...DEVELOPERS_VALUES, updatedAt: NOW }),
    ]);
  });

  it('restores the former standard item on down', () => {
    const updates = buildDevelopersSettingsCommandMenuItemUpdates({
      flatCommandMenuItemByUniversalIdentifier:
        buildExistingItems(DEVELOPERS_VALUES),
      now: NOW,
      direction: 'down',
    });

    expect(updates).toEqual([
      expect.objectContaining({ ...MCP_AND_APIS_VALUES, updatedAt: NOW }),
    ]);
  });

  it('keeps customized values', () => {
    const updates = buildDevelopersSettingsCommandMenuItemUpdates({
      flatCommandMenuItemByUniversalIdentifier: buildExistingItems({
        ...MCP_AND_APIS_VALUES,
        label: 'Open API settings',
        icon: 'IconApi',
      }),
      now: NOW,
      direction: 'up',
    });

    expect(updates).toEqual([
      expect.objectContaining({
        label: 'Open API settings',
        shortLabel: DEVELOPERS_VALUES.shortLabel,
        icon: 'IconApi',
        payload: DEVELOPERS_VALUES.payload,
      }),
    ]);
  });

  it('skips items already up to date', () => {
    expect(
      buildDevelopersSettingsCommandMenuItemUpdates({
        flatCommandMenuItemByUniversalIdentifier:
          buildExistingItems(DEVELOPERS_VALUES),
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
  });

  it('skips workspaces without the item', () => {
    expect(
      buildDevelopersSettingsCommandMenuItemUpdates({
        flatCommandMenuItemByUniversalIdentifier: {},
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
  });
});
