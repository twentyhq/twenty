import { isDefined } from 'twenty-shared/utils';

import { WORKFLOW_COMMAND_MENU_ITEM_AVAILABILITY_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/2-44/constants/workflow-command-menu-item-availability-expressions.constant';
import { buildWorkflowCommandMenuItemAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-44/utils/build-workflow-command-menu-item-availability-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-09-28T12:00:00.000Z';
const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-27T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const getStandardCommandMenuItem = (universalIdentifier: string) => {
  const commandMenuItem =
    allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
      universalIdentifier
    ];

  if (!isDefined(commandMenuItem)) {
    throw new Error(
      `Standard command menu item ${universalIdentifier} missing`,
    );
  }

  return commandMenuItem;
};

const withExpression = (
  commandMenuItem: FlatCommandMenuItem,
  conditionalAvailabilityExpression: string,
): FlatCommandMenuItem => ({
  ...commandMenuItem,
  conditionalAvailabilityExpression,
});

const buildUpdates = (
  commandMenuItems: FlatCommandMenuItem[],
  direction: 'up' | 'down',
) =>
  buildWorkflowCommandMenuItemAvailabilityUpdates({
    flatCommandMenuItemsByUniversalIdentifier: Object.fromEntries(
      commandMenuItems.map((commandMenuItem) => [
        commandMenuItem.universalIdentifier,
        commandMenuItem,
      ]),
    ),
    now: NOW,
    direction,
  });

describe.each(WORKFLOW_COMMAND_MENU_ITEM_AVAILABILITY_EXPRESSIONS)(
  'buildWorkflowCommandMenuItemAvailabilityUpdates for $universalIdentifier',
  ({ universalIdentifier, previousExpression, nextExpression }) => {
    const standardCommandMenuItem =
      getStandardCommandMenuItem(universalIdentifier);

    it('matches what a new workspace is seeded with', () => {
      expect(standardCommandMenuItem.conditionalAvailabilityExpression).toBe(
        nextExpression,
      );
    });

    it('moves the previous expression to the next one on up', () => {
      const legacyCommandMenuItem = withExpression(
        standardCommandMenuItem,
        previousExpression,
      );

      expect(buildUpdates([legacyCommandMenuItem], 'up')).toEqual([
        {
          ...legacyCommandMenuItem,
          conditionalAvailabilityExpression: nextExpression,
          updatedAt: NOW,
        },
      ]);
    });

    it('restores the previous expression on down', () => {
      expect(buildUpdates([standardCommandMenuItem], 'down')).toEqual([
        {
          ...standardCommandMenuItem,
          conditionalAvailabilityExpression: previousExpression,
          updatedAt: NOW,
        },
      ]);
    });

    it('skips items already migrated or carrying another expression', () => {
      expect(buildUpdates([standardCommandMenuItem], 'up')).toEqual([]);
      expect(
        buildUpdates(
          [withExpression(standardCommandMenuItem, 'isInSidePanel')],
          'up',
        ),
      ).toEqual([]);
    });
  },
);
