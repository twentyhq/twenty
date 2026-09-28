import { isDefined } from 'twenty-shared/utils';

import { buildDeactivateWorkflowAvailabilityUpdate } from 'src/database/commands/upgrade-version-command/2-44/utils/build-deactivate-workflow-availability-update.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-09-28T12:00:00.000Z';
const DEACTIVATE_WORKFLOW_UNIVERSAL_IDENTIFIER =
  '57f21a06-a17a-47b1-a123-90d90dbdf0b7';
const WHEN_CURRENT_VERSION_IS_ACTIVE =
  'everyEquals(selectedRecords, "currentVersion.status", "ACTIVE") and noneDefined(selectedRecords, "deletedAt")';
const WHEN_ANY_VERSION_IS_ACTIVE =
  '(everyEquals(selectedRecords, "currentVersion.status", "ACTIVE") or includesEvery(selectedRecords, "statuses", "ACTIVE")) and noneDefined(selectedRecords, "deletedAt")';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-27T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const buildDeactivateWorkflow = (
  conditionalAvailabilityExpression: string,
): FlatCommandMenuItem => {
  const deactivateWorkflow =
    allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
      DEACTIVATE_WORKFLOW_UNIVERSAL_IDENTIFIER
    ];

  if (!isDefined(deactivateWorkflow)) {
    throw new Error('Standard Deactivate workflow command menu item missing');
  }

  return { ...deactivateWorkflow, conditionalAvailabilityExpression };
};

const buildUpdate = (
  deactivateWorkflow: FlatCommandMenuItem,
  direction: 'up' | 'down',
) =>
  buildDeactivateWorkflowAvailabilityUpdate({
    flatCommandMenuItemsByUniversalIdentifier: {
      [DEACTIVATE_WORKFLOW_UNIVERSAL_IDENTIFIER]: deactivateWorkflow,
    },
    now: NOW,
    direction,
  });

describe('buildDeactivateWorkflowAvailabilityUpdate', () => {
  it('offers Deactivate whenever a version is active on up', () => {
    const deactivateWorkflow = buildDeactivateWorkflow(
      WHEN_CURRENT_VERSION_IS_ACTIVE,
    );

    expect(buildUpdate(deactivateWorkflow, 'up')).toEqual([
      {
        ...deactivateWorkflow,
        conditionalAvailabilityExpression: WHEN_ANY_VERSION_IS_ACTIVE,
        updatedAt: NOW,
      },
    ]);
  });

  it('restores the current-version check on down', () => {
    const deactivateWorkflow = buildDeactivateWorkflow(
      WHEN_ANY_VERSION_IS_ACTIVE,
    );

    expect(buildUpdate(deactivateWorkflow, 'down')).toEqual([
      {
        ...deactivateWorkflow,
        conditionalAvailabilityExpression: WHEN_CURRENT_VERSION_IS_ACTIVE,
        updatedAt: NOW,
      },
    ]);
  });

  it('skips items already migrated or carrying another expression', () => {
    expect(
      buildUpdate(buildDeactivateWorkflow(WHEN_ANY_VERSION_IS_ACTIVE), 'up'),
    ).toEqual([]);
    expect(buildUpdate(buildDeactivateWorkflow('isInSidePanel'), 'up')).toEqual(
      [],
    );
  });

  it('skips workspaces without the item', () => {
    expect(
      buildDeactivateWorkflowAvailabilityUpdate({
        flatCommandMenuItemsByUniversalIdentifier: {},
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
  });
});
