import { computeMirroredNavigationCommandMenuItemIds } from 'src/database/commands/upgrade-version-command/2-40/utils/compute-mirrored-navigation-command-menu-item-ids.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';
const OBJECT_ID = '20202020-0000-4000-8000-0000000000b1';
const OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000bb';

const buildFlatObjectMetadataMaps = (flatObjectMetadata: object) =>
  ({
    byUniversalIdentifier: {
      [OBJECT_UNIVERSAL_IDENTIFIER]: {
        id: OBJECT_ID,
        universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        applicationUniversalIdentifier: OWNER,
        ...flatObjectMetadata,
      },
    },
    universalIdentifierById: { [OBJECT_ID]: OBJECT_UNIVERSAL_IDENTIFIER },
    universalIdentifiersByApplicationId: {},
  }) as unknown as AllFlatEntityMaps['flatObjectMetadataMaps'];

const buildFlatCommandMenuItemMaps = (flatCommandMenuItem: object) =>
  ({
    byUniversalIdentifier: {
      'command-universal-identifier': {
        id: 'command-id',
        universalIdentifier: 'command-universal-identifier',
        applicationUniversalIdentifier: OWNER,
        engineComponentKey: EngineComponentKey.NAVIGATION,
        navigationTargetObjectMetadataId: OBJECT_ID,
        isSystemSideEffect: true,
        isActive: false,
        ...flatCommandMenuItem,
      },
    },
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  }) as unknown as AllFlatEntityMaps['flatCommandMenuItemMaps'];

describe('computeMirroredNavigationCommandMenuItemIds', () => {
  it('marks the navigation command of an object deactivated on the column', () => {
    expect(
      computeMirroredNavigationCommandMenuItemIds({
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps({}),
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps({
          isActive: false,
          overrides: null,
        }),
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual(new Set(['command-id']));
  });

  it('marks the navigation command of an object deactivated in a flat or authored entry', () => {
    for (const overrides of [
      { isActive: false },
      { [CUSTOM]: { isActive: false } },
    ]) {
      expect(
        computeMirroredNavigationCommandMenuItemIds({
          flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps({}),
          flatObjectMetadataMaps: buildFlatObjectMetadataMaps({
            isActive: true,
            overrides,
          }),
          workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        }),
      ).toEqual(new Set(['command-id']));
    }
  });

  it('does not mark the navigation command of an active object', () => {
    expect(
      computeMirroredNavigationCommandMenuItemIds({
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps({}),
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps({
          isActive: true,
          overrides: { [CUSTOM]: { labelSingular: 'Société' } },
        }),
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual(new Set());
  });

  it('only considers engine-managed navigation commands with a target object', () => {
    const inactiveObjectMaps = buildFlatObjectMetadataMaps({
      isActive: false,
      overrides: null,
    });

    for (const flatCommandMenuItem of [
      { isSystemSideEffect: false },
      { engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD },
      { navigationTargetObjectMetadataId: null },
      { navigationTargetObjectMetadataId: 'unknown-object-id' },
    ]) {
      expect(
        computeMirroredNavigationCommandMenuItemIds({
          flatCommandMenuItemMaps:
            buildFlatCommandMenuItemMaps(flatCommandMenuItem),
          flatObjectMetadataMaps: inactiveObjectMaps,
          workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        }),
      ).toEqual(new Set());
    }
  });
});
