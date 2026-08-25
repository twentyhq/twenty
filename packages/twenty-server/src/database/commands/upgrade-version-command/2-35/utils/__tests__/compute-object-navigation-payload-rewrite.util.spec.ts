import { computeObjectNavigationPayloadRewrite } from 'src/database/commands/upgrade-version-command/2-35/utils/compute-object-navigation-payload-rewrite.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

const NOW = '2026-08-25T00:00:00.000Z';

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

describe('computeObjectNavigationPayloadRewrite', () => {
  it('drops the object payload', () => {
    const rewrite = computeObjectNavigationPayloadRewrite({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({ id: 'command-1' }),
      ]),
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toHaveLength(1);
    expect(rewrite.flatCommandMenuItemsToUpdate[0]).toMatchObject({
      id: 'command-1',
      payload: null,
      navigationTargetObjectMetadataId: COMPANY_OBJECT_ID,
      updatedAt: NOW,
    });
    expect(rewrite.flatCommandMenuItemsWithoutTarget).toEqual([]);
  });

  it('is idempotent once the payload is dropped', () => {
    const rewrite = computeObjectNavigationPayloadRewrite({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({ id: 'command-1', payload: null }),
      ]),
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toEqual([]);
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
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toEqual([]);
  });

  it('leaves a non navigation command untouched', () => {
    const rewrite = computeObjectNavigationPayloadRewrite({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
        }),
      ]),
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toEqual([]);
  });

  it('skips a command whose target column was never backfilled', () => {
    const rewrite = computeObjectNavigationPayloadRewrite({
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        buildFlatCommandMenuItem({
          id: 'command-1',
          navigationTargetObjectMetadataId: null,
          navigationTargetObjectMetadataUniversalIdentifier: null,
        }),
      ]),
      now: NOW,
    });

    expect(rewrite.flatCommandMenuItemsToUpdate).toEqual([]);
    expect(
      rewrite.flatCommandMenuItemsWithoutTarget.map(({ id }) => id),
    ).toEqual(['command-1']);
  });
});
