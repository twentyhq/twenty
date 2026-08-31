import { computeObjectNavigationPayloadRewrite } from 'src/database/commands/upgrade-version-command/2-38/utils/compute-object-navigation-payload-rewrite.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const NOW = '2026-08-31T00:00:00.000Z';

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
    navigationTargetObjectMetadataId: COMPANY_OBJECT_ID,
    navigationTargetObjectMetadataUniversalIdentifier:
      COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
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

describe('computeObjectNavigationPayloadRewrite', () => {
  it('rewrites a legacy object payload to { path: null }', () => {
    const rewrite = computeObjectNavigationPayloadRewrite({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({ id: 'command-1' }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toHaveLength(1);
    expect(rewrite.flatCommandMenuItemsToUpdate[0]).toMatchObject({
      id: 'command-1',
      payload: { path: null },
      navigationTargetObjectMetadataId: COMPANY_OBJECT_ID,
      updatedAt: NOW,
    });
    expect(rewrite.flatCommandMenuItemsToDelete).toEqual([]);
  });

  it('is idempotent once the payload is rewritten', () => {
    const rewrite = computeObjectNavigationPayloadRewrite({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({ id: 'command-1', payload: { path: null } }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toEqual([]);
    expect(rewrite.flatCommandMenuItemsToDelete).toEqual([]);
  });

  it('leaves a path-based navigation command untouched', () => {
    const rewrite = computeObjectNavigationPayloadRewrite({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          payload: { path: '/settings' },
          navigationTargetObjectMetadataId: null,
          navigationTargetObjectMetadataUniversalIdentifier: null,
        }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toEqual([]);
    expect(rewrite.flatCommandMenuItemsToDelete).toEqual([]);
  });

  it('leaves a non navigation command untouched', () => {
    const rewrite = computeObjectNavigationPayloadRewrite({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
        }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toEqual([]);
  });

  it('derives a missing target from the payload before rewriting it', () => {
    const rewrite = computeObjectNavigationPayloadRewrite({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          navigationTargetObjectMetadataId: null,
          navigationTargetObjectMetadataUniversalIdentifier: null,
        }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toHaveLength(1);
    expect(rewrite.flatCommandMenuItemsToUpdate[0]).toMatchObject({
      id: 'command-1',
      payload: { path: null },
      navigationTargetObjectMetadataId: COMPANY_OBJECT_ID,
      navigationTargetObjectMetadataUniversalIdentifier:
        COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
    });
  });

  it('deletes a targetless command whose payload points at a missing object', () => {
    const rewrite = computeObjectNavigationPayloadRewrite({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          payload: { objectMetadataItemId: 'deleted-object' },
          navigationTargetObjectMetadataId: null,
          navigationTargetObjectMetadataUniversalIdentifier: null,
        }),
      ]),
      flatObjectMetadataMaps,
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toEqual([]);
    expect(rewrite.flatCommandMenuItemsToDelete.map(({ id }) => id)).toEqual([
      'command-1',
    ]);
  });
});
