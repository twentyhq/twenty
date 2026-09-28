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

const buildCommandMenuItem = (
  universalIdentifier: string,
  conditionalAvailabilityExpression: string,
): FlatCommandMenuItem => {
  const commandMenuItem =
    allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
      universalIdentifier
    ];

  if (!isDefined(commandMenuItem)) {
    throw new Error(
      `Standard command menu item ${universalIdentifier} missing`,
    );
  }

  return { ...commandMenuItem, conditionalAvailabilityExpression };
};

const buildUpdates = (
  commandMenuItem: FlatCommandMenuItem,
  direction: 'up' | 'down',
) =>
  buildWorkflowCommandMenuItemAvailabilityUpdates({
    flatCommandMenuItemsByUniversalIdentifier: {
      [commandMenuItem.universalIdentifier]: commandMenuItem,
    },
    now: NOW,
    direction,
  });

describe.each(
  Object.entries(WORKFLOW_COMMAND_MENU_ITEM_AVAILABILITY_EXPRESSIONS),
)(
  'buildWorkflowCommandMenuItemAvailabilityUpdates for %s',
  (_name, { universalIdentifier, previousExpression, nextExpression }) => {
    it('moves the previous expression to the next one on up', () => {
      const commandMenuItem = buildCommandMenuItem(
        universalIdentifier,
        previousExpression,
      );

      expect(buildUpdates(commandMenuItem, 'up')).toEqual([
        {
          ...commandMenuItem,
          conditionalAvailabilityExpression: nextExpression,
          updatedAt: NOW,
        },
      ]);
    });

    it('restores the previous expression on down', () => {
      const commandMenuItem = buildCommandMenuItem(
        universalIdentifier,
        nextExpression,
      );

      expect(buildUpdates(commandMenuItem, 'down')).toEqual([
        {
          ...commandMenuItem,
          conditionalAvailabilityExpression: previousExpression,
          updatedAt: NOW,
        },
      ]);
    });

    it('skips items already migrated or carrying another expression', () => {
      expect(
        buildUpdates(
          buildCommandMenuItem(universalIdentifier, nextExpression),
          'up',
        ),
      ).toEqual([]);
      expect(
        buildUpdates(
          buildCommandMenuItem(universalIdentifier, 'isInSidePanel'),
          'up',
        ),
      ).toEqual([]);
    });
  },
);
