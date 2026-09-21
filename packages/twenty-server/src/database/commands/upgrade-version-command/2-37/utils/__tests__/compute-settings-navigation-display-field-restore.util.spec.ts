import { computeSettingsNavigationDisplayFieldRestore } from 'src/database/commands/upgrade-version-command/2-37/utils/compute-settings-navigation-display-field-restore.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { NAVIGATION_INTERPOLATED_ICON, NAVIGATION_INTERPOLATED_LABEL, NAVIGATION_INTERPOLATED_SHORT_LABEL } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-08-27T00:00:00.000Z';

const GO_TO_SETTINGS = STANDARD_COMMAND_MENU_ITEMS.goToSettings;

const buildFlatCommandMenuItem = (
  overrides: Partial<FlatCommandMenuItem> & Pick<FlatCommandMenuItem, 'id'>,
): FlatCommandMenuItem =>
  ({
    universalIdentifier: overrides.id,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    payload: { path: '/settings/profile' },
    label: NAVIGATION_INTERPOLATED_LABEL,
    shortLabel: NAVIGATION_INTERPOLATED_SHORT_LABEL,
    icon: NAVIGATION_INTERPOLATED_ICON,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as FlatCommandMenuItem;

const buildFlatCommandMenuItemMaps = (
  flatCommandMenuItems: FlatCommandMenuItem[],
): FlatEntityMaps<FlatCommandMenuItem> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatCommandMenuItems.map((item) => [item.universalIdentifier, item]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatCommandMenuItems.map((item) => [item.id, item.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

describe('computeSettingsNavigationDisplayFieldRestore', () => {
  it('restores the standard display fields on a corrupted settings navigation item', () => {
    const itemsToUpdate = computeSettingsNavigationDisplayFieldRestore({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          universalIdentifier: GO_TO_SETTINGS.universalIdentifier,
        }),
      ]),
      now: NOW,
    });

    expect(itemsToUpdate).toHaveLength(1);
    expect(itemsToUpdate[0]).toMatchObject({
      id: 'command-1',
      label: GO_TO_SETTINGS.label,
      shortLabel: GO_TO_SETTINGS.shortLabel,
      icon: GO_TO_SETTINGS.icon,
      updatedAt: NOW,
    });
  });

  it('is idempotent once the display fields match the standard definition', () => {
    const itemsToUpdate = computeSettingsNavigationDisplayFieldRestore({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          universalIdentifier: GO_TO_SETTINGS.universalIdentifier,
          label: GO_TO_SETTINGS.label,
          shortLabel: GO_TO_SETTINGS.shortLabel,
          icon: GO_TO_SETTINGS.icon,
        }),
      ]),
      now: NOW,
    });

    expect(itemsToUpdate).toEqual([]);
  });

  it('leaves an object navigation item on its placeholder templates', () => {
    const itemsToUpdate = computeSettingsNavigationDisplayFieldRestore({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          payload: {
            objectMetadataItemId: 'object-1',
          } as unknown as FlatCommandMenuItem['payload'],
        }),
      ]),
      now: NOW,
    });

    expect(itemsToUpdate).toEqual([]);
  });

  it('leaves a path navigation item that is not in the standard definition untouched', () => {
    const itemsToUpdate = computeSettingsNavigationDisplayFieldRestore({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({ id: 'command-1' }),
      ]),
      now: NOW,
    });

    expect(itemsToUpdate).toEqual([]);
  });

  it('leaves a non navigation item untouched even when its label differs from the definition', () => {
    const itemsToUpdate = computeSettingsNavigationDisplayFieldRestore({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          universalIdentifier: GO_TO_SETTINGS.universalIdentifier,
          engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
        }),
      ]),
      now: NOW,
    });

    expect(itemsToUpdate).toEqual([]);
  });
});
