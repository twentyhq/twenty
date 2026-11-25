import { buildCreatePermissionCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-57/utils/build-create-permission-command-menu-item-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-11-07T00:00:00.000Z';

const buildMaps = (
  commandMenuItems: Pick<
    FlatCommandMenuItem,
    'universalIdentifier' | 'conditionalAvailabilityExpression'
  >[],
) =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      commandMenuItems.map((commandMenuItem) => [
        commandMenuItem.universalIdentifier,
        commandMenuItem,
      ]),
    ),
  }) as FlatEntityMaps<FlatCommandMenuItem>;

describe('buildCreatePermissionCommandMenuItemUpdates', () => {
  it('should read the create permission in a command that creates records', () => {
    const [update] = buildCreatePermissionCommandMenuItemUpdates({
      flatCommandMenuItemMaps: buildMaps([
        {
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.duplicateDashboard.universalIdentifier,
          conditionalAvailabilityExpression:
            'noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords',
        },
      ]),
      now: NOW,
    });

    expect(update.conditionalAvailabilityExpression).toBe(
      'noneDefined(selectedRecords, "deletedAt") and objectPermissions.canCreateObjectRecords',
    );
    expect(update.updatedAt).toBe(NOW);
  });

  it('should leave other commands and already migrated ones alone', () => {
    expect(
      buildCreatePermissionCommandMenuItemUpdates({
        flatCommandMenuItemMaps: buildMaps([
          {
            universalIdentifier:
              STANDARD_COMMAND_MENU_ITEMS.updateMultipleRecords
                .universalIdentifier,
            conditionalAvailabilityExpression:
              'objectPermissions.canUpdateObjectRecords',
          },
          {
            universalIdentifier:
              STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier,
            conditionalAvailabilityExpression:
              'objectPermissions.canCreateObjectRecords',
          },
        ]),
        now: NOW,
      }),
    ).toEqual([]);
  });
});
