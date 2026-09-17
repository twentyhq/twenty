import { buildUnpinCreationCommandsOnSelectionUpdates } from 'src/database/commands/upgrade-version-command/2-41/utils/build-unpin-creation-commands-on-selection-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-09-16T00:00:00.000Z';

const { universalIdentifier: CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.createNewRecord;

const { universalIdentifier: COMPOSE_CAMPAIGN_PINNED_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned;

const buildExistingItem = (
  universalIdentifier: string,
  conditionalPinnedExpression: string | null,
): FlatCommandMenuItem =>
  ({
    universalIdentifier,
    conditionalPinnedExpression,
    updatedAt: '2025-01-01T00:00:00.000Z',
  }) as FlatCommandMenuItem;

describe('buildUnpinCreationCommandsOnSelectionUpdates', () => {
  it('unpins the creation commands while records are selected', () => {
    const updates = buildUnpinCreationCommandsOnSelectionUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER]: buildExistingItem(
          CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER,
          null,
        ),
        [COMPOSE_CAMPAIGN_PINNED_UNIVERSAL_IDENTIFIER]: buildExistingItem(
          COMPOSE_CAMPAIGN_PINNED_UNIVERSAL_IDENTIFIER,
          null,
        ),
      },
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({
        universalIdentifier: CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER,
        conditionalPinnedExpression: 'numberOfSelectedRecords == 0',
        updatedAt: NOW,
      }),
      expect.objectContaining({
        universalIdentifier: COMPOSE_CAMPAIGN_PINNED_UNIVERSAL_IDENTIFIER,
        conditionalPinnedExpression: 'numberOfSelectedRecords == 0',
        updatedAt: NOW,
      }),
    ]);
  });

  it('leaves an already customized pinned expression untouched', () => {
    const updates = buildUnpinCreationCommandsOnSelectionUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER]: buildExistingItem(
          CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER,
          'numberOfSelectedRecords == 1',
        ),
      },
      now: NOW,
    });

    expect(updates).toEqual([]);
  });

  it('returns no update when the command menu items are missing', () => {
    const updates = buildUnpinCreationCommandsOnSelectionUpdates({
      flatCommandMenuItemByUniversalIdentifier: {},
      now: NOW,
    });

    expect(updates).toEqual([]);
  });
});
