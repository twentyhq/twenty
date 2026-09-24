import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { MetadataReadability } from 'twenty-shared/types';

import { findSystemReadableObjectNavigationCommandMenuItems } from 'src/database/commands/upgrade-version-command/2-43/utils/find-system-readable-object-navigation-command-menu-items.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const SYSTEM_OBJECT_ID = 'system-object-id';
const OPEN_OBJECT_ID = 'open-object-id';

const buildFlatObjectMetadataMaps = (): FlatEntityMaps<FlatObjectMetadata> =>
  ({
    byUniversalIdentifier: {
      'system-object': {
        id: SYSTEM_OBJECT_ID,
        universalIdentifier: 'system-object',
        readability: MetadataReadability.SYSTEM,
      },
      'open-object': {
        id: OPEN_OBJECT_ID,
        universalIdentifier: 'open-object',
        readability: MetadataReadability.OPEN,
      },
    },
    universalIdentifierById: {
      [SYSTEM_OBJECT_ID]: 'system-object',
      [OPEN_OBJECT_ID]: 'open-object',
    },
  }) as unknown as FlatEntityMaps<FlatObjectMetadata>;

const buildFlatCommandMenuItem = (
  overrides: Partial<FlatCommandMenuItem>,
): FlatCommandMenuItem =>
  ({
    id: 'command-menu-item-id',
    universalIdentifier: 'command-menu-item',
    engineComponentKey: EngineComponentKey.NAVIGATION,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    navigationTargetObjectMetadataId: SYSTEM_OBJECT_ID,
    ...overrides,
  }) as FlatCommandMenuItem;

describe('findSystemReadableObjectNavigationCommandMenuItems', () => {
  it('returns standard navigation items targeting a SYSTEM-readable object', () => {
    const result = findSystemReadableObjectNavigationCommandMenuItems({
      flatCommandMenuItems: [
        buildFlatCommandMenuItem({ id: 'system' }),
        buildFlatCommandMenuItem({
          id: 'open',
          navigationTargetObjectMetadataId: OPEN_OBJECT_ID,
        }),
        undefined,
      ],
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps(),
    });

    expect(result.map(({ id }) => id)).toEqual(['system']);
  });

  it('ignores items that are not standard navigation items', () => {
    const result = findSystemReadableObjectNavigationCommandMenuItems({
      flatCommandMenuItems: [
        buildFlatCommandMenuItem({
          id: 'not-navigation',
          engineComponentKey: EngineComponentKey.ADD_TO_FAVORITES,
        }),
        buildFlatCommandMenuItem({
          id: 'other-application',
          applicationUniversalIdentifier: 'other-application',
        }),
        buildFlatCommandMenuItem({
          id: 'no-target',
          navigationTargetObjectMetadataId: null,
        }),
        buildFlatCommandMenuItem({
          id: 'unknown-target',
          navigationTargetObjectMetadataId: 'unknown-object-id',
        }),
      ],
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps(),
    });

    expect(result).toEqual([]);
  });
});
