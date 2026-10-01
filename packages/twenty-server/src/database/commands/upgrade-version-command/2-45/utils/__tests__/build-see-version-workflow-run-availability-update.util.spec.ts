import { isDefined } from 'twenty-shared/utils';

import { buildSeeVersionWorkflowRunAvailabilityUpdate } from 'src/database/commands/upgrade-version-command/2-45/utils/build-see-version-workflow-run-availability-update.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-01T12:00:00.000Z';
const SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER =
  'cc3a065c-c89e-40ac-9449-4272c55b1bb8';
const NEXT_EXPRESSION = 'not featureFlags.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-30T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const buildSeeVersionWorkflowRun = (
  conditionalAvailabilityExpression: string | null,
): FlatCommandMenuItem => {
  const seeVersionWorkflowRun =
    allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
      SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER
    ];

  if (!isDefined(seeVersionWorkflowRun)) {
    throw new Error('Standard See Version workflow run item missing');
  }

  return { ...seeVersionWorkflowRun, conditionalAvailabilityExpression };
};

const buildUpdate = (
  seeVersionWorkflowRun: FlatCommandMenuItem,
  direction: 'up' | 'down',
) =>
  buildSeeVersionWorkflowRunAvailabilityUpdate({
    flatCommandMenuItemsByUniversalIdentifier: {
      [SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER]: seeVersionWorkflowRun,
    },
    now: NOW,
    direction,
  });

describe('buildSeeVersionWorkflowRunAvailabilityUpdate', () => {
  it('matches the standard application expression', () => {
    expect(
      allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
        SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER
      ]?.conditionalAvailabilityExpression,
    ).toBe(NEXT_EXPRESSION);
  });

  it('hides See Version under the core flag on up', () => {
    const seeVersionWorkflowRun = buildSeeVersionWorkflowRun(null);

    expect(buildUpdate(seeVersionWorkflowRun, 'up')).toEqual([
      {
        ...seeVersionWorkflowRun,
        conditionalAvailabilityExpression: NEXT_EXPRESSION,
        updatedAt: NOW,
      },
    ]);
  });

  it('restores the previous expression on down', () => {
    const seeVersionWorkflowRun = buildSeeVersionWorkflowRun(NEXT_EXPRESSION);

    expect(buildUpdate(seeVersionWorkflowRun, 'down')).toEqual([
      {
        ...seeVersionWorkflowRun,
        conditionalAvailabilityExpression: null,
        updatedAt: NOW,
      },
    ]);
  });

  it('skips items already migrated or carrying another expression', () => {
    expect(
      buildUpdate(buildSeeVersionWorkflowRun(NEXT_EXPRESSION), 'up'),
    ).toEqual([]);
    expect(
      buildUpdate(buildSeeVersionWorkflowRun('isInSidePanel'), 'up'),
    ).toEqual([]);
  });

  it('skips workspaces without the item', () => {
    expect(
      buildSeeVersionWorkflowRunAvailabilityUpdate({
        flatCommandMenuItemsByUniversalIdentifier: {},
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
  });
});
