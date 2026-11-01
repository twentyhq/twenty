import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { findSystemReadableObjectNavigationCommandMenuItems } from 'src/database/commands/upgrade-version-command/2-43/utils/find-system-readable-object-navigation-command-menu-items.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const SYSTEM_OBJECT_ID = 'system-object-id';
const OPEN_OBJECT_ID = 'open-object-id';

const SYSTEM_READABLE_OBJECT_METADATA_IDS = new Set([SYSTEM_OBJECT_ID]);

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
      systemReadableObjectMetadataIds: SYSTEM_READABLE_OBJECT_METADATA_IDS,
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
      systemReadableObjectMetadataIds: SYSTEM_READABLE_OBJECT_METADATA_IDS,
    });

    expect(result).toEqual([]);
  });
});
