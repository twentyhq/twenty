import { isDefined } from 'twenty-shared/utils';

import { findSeeVersionWorkflowRunCommandMenuItem } from 'src/database/commands/upgrade-version-command/2-45/utils/find-see-version-workflow-run-command-menu-item.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER =
  'cc3a065c-c89e-40ac-9449-4272c55b1bb8';
const SEE_WORKFLOW_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER =
  '9d9cc62d-3543-45c3-93f3-23d2d8979f2b';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-10-01T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const buildCommandMenuItem = (
  engineComponentKey: EngineComponentKey,
): FlatCommandMenuItem => {
  const seeWorkflowWorkflowRun =
    allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
      SEE_WORKFLOW_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER
    ];

  if (!isDefined(seeWorkflowWorkflowRun)) {
    throw new Error('Standard See Workflow workflow run item missing');
  }

  return {
    ...seeWorkflowWorkflowRun,
    universalIdentifier: SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER,
    engineComponentKey,
  };
};

describe('findSeeVersionWorkflowRunCommandMenuItem', () => {
  it('is no longer part of the standard application', () => {
    expect(
      allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
        SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER
      ],
    ).toBeUndefined();
  });

  it('returns the seeded See Version item', () => {
    const seeVersionWorkflowRun = buildCommandMenuItem(
      EngineComponentKey.SEE_VERSION_WORKFLOW_RUN,
    );

    expect(
      findSeeVersionWorkflowRunCommandMenuItem({
        flatCommandMenuItemsByUniversalIdentifier: {
          [SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER]: seeVersionWorkflowRun,
        },
      }),
    ).toBe(seeVersionWorkflowRun);
  });

  it('ignores an item with the same identifier but another component', () => {
    expect(
      findSeeVersionWorkflowRunCommandMenuItem({
        flatCommandMenuItemsByUniversalIdentifier: {
          [SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER]: buildCommandMenuItem(
            EngineComponentKey.SEE_WORKFLOW_WORKFLOW_RUN,
          ),
        },
      }),
    ).toBeUndefined();
  });

  it('returns nothing when the workspace no longer has the item', () => {
    expect(
      findSeeVersionWorkflowRunCommandMenuItem({
        flatCommandMenuItemsByUniversalIdentifier: {},
      }),
    ).toBeUndefined();
  });
});
