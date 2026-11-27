import { getSystemNavigationCommandMenuItemUniversalIdentifier } from 'twenty-shared/application';

import { buildObjectNavigationCommandMenuItemRepairs } from 'src/database/commands/upgrade-version-command/2-61/utils/build-object-navigation-command-menu-item-repairs.util';
import { getLegacyNavigationCommandUniversalIdentifier } from 'src/database/commands/upgrade-version-command/utils/build-legacy-navigation-flat-command-menu-item.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';

const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000ad';
const OBJECT_ID = '20202020-0000-4000-8000-0000000000b1';
const OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000bb';
const COMMAND_MENU_ITEM_ID = '20202020-0000-4000-8000-0000000000c1';

const LEGACY_UNIVERSAL_IDENTIFIER =
  getLegacyNavigationCommandUniversalIdentifier(OBJECT_UNIVERSAL_IDENTIFIER);

const DERIVED_UNIVERSAL_IDENTIFIER =
  getSystemNavigationCommandMenuItemUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

const EXPECTED_UPDATE = {
  navigationTargetObjectMetadataId: OBJECT_ID,
  payload: null,
  conditionalAvailabilityExpression: 'targetObjectReadPermissions.messageList',
};

type CommandMenuItem = {
  id: string;
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
  engineComponentKey: EngineComponentKey;
  navigationTargetObjectMetadataId: string | null;
};

const buildCommandMenuItem = (
  commandMenuItem: Partial<CommandMenuItem> &
    Pick<CommandMenuItem, 'universalIdentifier'>,
): CommandMenuItem => ({
  id: COMMAND_MENU_ITEM_ID,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  engineComponentKey: EngineComponentKey.NAVIGATION,
  navigationTargetObjectMetadataId: null,
  ...commandMenuItem,
});

const buildRepairs = (commandMenuItems: CommandMenuItem[]) =>
  buildObjectNavigationCommandMenuItemRepairs({
    flatCommandMenuItemMaps: {
      byUniversalIdentifier: Object.fromEntries(
        commandMenuItems.map((commandMenuItem) => [
          commandMenuItem.universalIdentifier,
          commandMenuItem,
        ]),
      ),
    },
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [OBJECT_UNIVERSAL_IDENTIFIER]: {
          id: OBJECT_ID,
          universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          nameSingular: 'messageList',
        },
      },
    },
  });

describe('buildObjectNavigationCommandMenuItemRepairs', () => {
  it('targets the object and moves a legacy-identifier command onto the derived identifier', () => {
    expect(
      buildRepairs([
        buildCommandMenuItem({
          universalIdentifier: LEGACY_UNIVERSAL_IDENTIFIER,
        }),
      ]),
    ).toEqual([
      {
        id: COMMAND_MENU_ITEM_ID,
        update: {
          ...EXPECTED_UPDATE,
          universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
        },
      },
    ]);
  });

  it('targets the object of a derived-identifier command without changing its identifier', () => {
    expect(
      buildRepairs([
        buildCommandMenuItem({
          universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
        }),
      ]),
    ).toEqual([{ id: COMMAND_MENU_ITEM_ID, update: EXPECTED_UPDATE }]);
  });

  it('leaves a command that already targets its object', () => {
    expect(
      buildRepairs([
        buildCommandMenuItem({
          universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
          navigationTargetObjectMetadataId: OBJECT_ID,
        }),
      ]),
    ).toEqual([]);
  });

  it('leaves the legacy command when the derived identifier is already held', () => {
    expect(
      buildRepairs([
        buildCommandMenuItem({
          universalIdentifier: LEGACY_UNIVERSAL_IDENTIFIER,
        }),
        buildCommandMenuItem({
          id: '20202020-0000-4000-8000-0000000000c2',
          universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
          navigationTargetObjectMetadataId: OBJECT_ID,
        }),
      ]),
    ).toEqual([]);
  });

  it('leaves a command another application authored for the object', () => {
    expect(
      buildRepairs([
        buildCommandMenuItem({
          universalIdentifier: LEGACY_UNIVERSAL_IDENTIFIER,
          applicationUniversalIdentifier:
            '20202020-0000-4000-8000-0000000000ae',
        }),
      ]),
    ).toEqual([]);
  });

  it('leaves a command that is not a navigation', () => {
    expect(
      buildRepairs([
        buildCommandMenuItem({
          universalIdentifier: LEGACY_UNIVERSAL_IDENTIFIER,
          engineComponentKey: EngineComponentKey.DELETE_RECORDS,
        }),
      ]),
    ).toEqual([]);
  });
});
