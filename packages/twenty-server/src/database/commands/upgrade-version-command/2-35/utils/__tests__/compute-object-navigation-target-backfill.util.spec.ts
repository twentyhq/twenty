import { computeObjectNavigationTargetBackfill } from 'src/database/commands/upgrade-version-command/2-35/utils/compute-object-navigation-target-backfill.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const NOW = '2026-08-24T00:00:00.000Z';

const COMPANY_OBJECT_ID = '20202020-0000-0000-0000-00000000c0c0';
const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-1111-1111-1111-11111111c0c0';

const buildFlatCommandMenuItem = (
  overrides: Partial<FlatCommandMenuItem> & Pick<FlatCommandMenuItem, 'id'>,
): FlatCommandMenuItem =>
  ({
    universalIdentifier: overrides.id,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    payload: { objectMetadataItemId: COMPANY_OBJECT_ID },
    navigationTargetObjectMetadataId: null,
    navigationTargetObjectMetadataUniversalIdentifier: null,
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

const flatObjectMetadataMaps = {
  byUniversalIdentifier: {
    [COMPANY_OBJECT_UNIVERSAL_IDENTIFIER]: {
      id: COMPANY_OBJECT_ID,
      universalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
    },
  },
  universalIdentifierById: {
    [COMPANY_OBJECT_ID]: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  },
  universalIdentifiersByApplicationId: {},
} as unknown as FlatEntityMaps<FlatObjectMetadata>;

describe('computeObjectNavigationTargetBackfill', () => {
  it('derives the target from the object navigation payload', () => {
    const backfill = computeObjectNavigationTargetBackfill({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({ id: 'command-1' }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(backfill.flatCommandMenuItemsToUpdate).toHaveLength(1);
    expect(backfill.flatCommandMenuItemsToUpdate[0]).toMatchObject({
      id: 'command-1',
      navigationTargetObjectMetadataId: COMPANY_OBJECT_ID,
      navigationTargetObjectMetadataUniversalIdentifier:
        COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
      updatedAt: NOW,
    });
  });

  it('is idempotent once the target column is set', () => {
    const backfill = computeObjectNavigationTargetBackfill({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          navigationTargetObjectMetadataId: COMPANY_OBJECT_ID,
          navigationTargetObjectMetadataUniversalIdentifier:
            COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(backfill.flatCommandMenuItemsToUpdate).toEqual([]);
  });

  it('leaves a path-based navigation command untouched', () => {
    const backfill = computeObjectNavigationTargetBackfill({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          payload: { path: '/settings' },
        }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(backfill.flatCommandMenuItemsToUpdate).toEqual([]);
    expect(backfill.flatCommandMenuItemsToDelete).toEqual([]);
  });

  it('leaves a non navigation command untouched', () => {
    const backfill = computeObjectNavigationTargetBackfill({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
        }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(backfill.flatCommandMenuItemsToUpdate).toEqual([]);
  });

  it('deletes a command whose payload points at a missing object', () => {
    const backfill = computeObjectNavigationTargetBackfill({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          payload: { objectMetadataItemId: 'deleted-object' },
        }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(backfill.flatCommandMenuItemsToUpdate).toEqual([]);
    expect(backfill.flatCommandMenuItemsToDelete.map(({ id }) => id)).toEqual([
      'command-1',
    ]);
  });

  it('backfills every command targeting the same object', () => {
    const backfill = computeObjectNavigationTargetBackfill({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({ id: 'command-1' }),
        buildFlatCommandMenuItem({ id: 'command-2' }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(backfill.flatCommandMenuItemsToUpdate.map(({ id }) => id)).toEqual([
      'command-1',
      'command-2',
    ]);
  });

  it('backfills a command pointing at an object another command already targets', () => {
    const backfill = computeObjectNavigationTargetBackfill({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          navigationTargetObjectMetadataId: COMPANY_OBJECT_ID,
          navigationTargetObjectMetadataUniversalIdentifier:
            COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        }),
        buildFlatCommandMenuItem({ id: 'command-2' }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(backfill.flatCommandMenuItemsToUpdate.map(({ id }) => id)).toEqual([
      'command-2',
    ]);
  });
});
