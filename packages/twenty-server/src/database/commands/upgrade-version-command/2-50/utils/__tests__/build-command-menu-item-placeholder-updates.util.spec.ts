import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { interpolateMessagePlaceholders } from 'twenty-shared/i18n';

import { buildCommandMenuItemPlaceholderUpdates } from 'src/database/commands/upgrade-version-command/2-50/utils/build-command-menu-item-placeholder-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';

const NOW = '2026-10-20T10:00:00.000Z';
const COMMAND_MENU_ITEM = createStandardCommandMenuItemFlatMetadata({
  commandMenuItemName: 'destroyRecords',
  commandMenuItemId: 'command-menu-item-id',
  workspaceId: 'workspace-id',
  twentyStandardApplicationId: 'application-id',
  dependencyFlatEntityMaps: {
    flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
  },
  now: '2026-10-19T10:00:00.000Z',
});

const buildUpdates = (commandMenuItem: FlatCommandMenuItem) =>
  buildCommandMenuItemPlaceholderUpdates({
    commandMenuItems: [commandMenuItem],
    now: NOW,
  });

describe('buildCommandMenuItemPlaceholderUpdates', () => {
  it.each([
    {
      legacyLabel: 'Permanently destroy ${capitalize(objectMetadataLabel)}',
      expectedLabel: 'Permanently destroy {objectLabel}',
      expectedDisplayLabel: 'Permanently destroy People',
    },
    {
      legacyLabel:
        'Permanently destroy ${capitalize(objectMetadataItem.labelSingular)}',
      expectedLabel: 'Permanently destroy {objectLabelSingular}',
      expectedDisplayLabel: 'Permanently destroy Person',
    },
    {
      legacyLabel:
        'Permanently destroy ${capitalize(objectMetadataItem.labelPlural)}',
      expectedLabel: 'Permanently destroy {objectLabelPlural}',
      expectedDisplayLabel: 'Permanently destroy People',
    },
  ])(
    'repairs $legacyLabel for display',
    ({ legacyLabel, expectedLabel, expectedDisplayLabel }) => {
      const [updatedItem] = buildUpdates({
        ...COMMAND_MENU_ITEM,
        label: legacyLabel,
      });

      expect(updatedItem?.label).toBe(expectedLabel);
      expect(
        interpolateMessagePlaceholders(updatedItem?.label ?? '', {
          objectLabel: 'People',
          objectLabelSingular: 'Person',
          objectLabelPlural: 'People',
        }),
      ).toBe(expectedDisplayLabel);
      expect(updatedItem?.updatedAt).toBe(NOW);
    },
  );

  it('repairs short labels and object icons', () => {
    const [updatedItem] = buildUpdates({
      ...COMMAND_MENU_ITEM,
      shortLabel: 'New ${capitalize(objectMetadataItem.labelSingular)}',
      icon: '${objectMetadataItem.icon}',
    });

    expect(updatedItem?.shortLabel).toBe('New {objectLabelSingular}');
    expect(updatedItem?.icon).toBe('{objectIcon}');
  });

  it('repairs authored overrides while preserving custom presentation', () => {
    const [updatedItem] = buildUpdates({
      ...COMMAND_MENU_ITEM,
      overrides: {
        [TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          label: 'Erase ${capitalize(objectMetadataLabel)}',
          icon: 'IconFlame',
          isPinned: true,
        },
      },
      universalOverrides: {
        [TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          label: 'Erase ${capitalize(objectMetadataLabel)}',
          icon: 'IconFlame',
          isPinned: true,
        },
      },
    });

    const expectedOverrides = {
      [TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER]: {
        label: 'Erase {objectLabel}',
        icon: 'IconFlame',
        isPinned: true,
      },
    };

    expect(updatedItem?.overrides).toEqual(expectedOverrides);
    expect(updatedItem?.universalOverrides).toEqual(expectedOverrides);
  });

  it('repairs legacy flat overrides', () => {
    const [updatedItem] = buildUpdates({
      ...COMMAND_MENU_ITEM,
      overrides: {
        label: 'Erase ${capitalize(objectMetadataLabel)}',
      } as unknown as FlatCommandMenuItem['overrides'],
    });

    expect(updatedItem?.overrides).toEqual({ label: 'Erase {objectLabel}' });
  });

  it('repairs placeholders in existing translation overrides', () => {
    const overrides = {
      [TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER]: {
        label: 'Erase permanently',
        translations: {
          en: { label: 'Erase ${capitalize(objectMetadataLabel)}' },
        },
      },
    };
    const [updatedItem] = buildUpdates({
      ...COMMAND_MENU_ITEM,
      overrides,
      universalOverrides: overrides,
    });

    expect(updatedItem?.overrides).toEqual({
      [TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER]: {
        label: 'Erase permanently',
        translations: { en: { label: 'Erase {objectLabel}' } },
      },
    });
    expect(updatedItem?.universalOverrides).toEqual(updatedItem?.overrides);
  });

  it('skips missing, current and custom labels', () => {
    expect(
      buildCommandMenuItemPlaceholderUpdates({
        commandMenuItems: [
          undefined,
          COMMAND_MENU_ITEM,
          { ...COMMAND_MENU_ITEM, label: 'Erase permanently' },
        ],
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('skips items owned by another application', () => {
    expect(
      buildUpdates({
        ...COMMAND_MENU_ITEM,
        applicationUniversalIdentifier: 'custom-application',
        label: 'Erase ${capitalize(objectMetadataLabel)}',
      }),
    ).toEqual([]);
  });

  it('can be rerun safely without mutating the original item', () => {
    const legacyItem = {
      ...COMMAND_MENU_ITEM,
      label: 'Erase ${capitalize(objectMetadataLabel)}',
    };
    const updates = buildUpdates(legacyItem);

    expect(
      buildCommandMenuItemPlaceholderUpdates({
        commandMenuItems: updates,
        now: NOW,
      }),
    ).toEqual([]);
    expect(legacyItem.label).toBe('Erase ${capitalize(objectMetadataLabel)}');
  });
});
