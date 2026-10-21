import { isDefined } from 'twenty-shared/utils';

import { findAddNodeWorkflowCommandMenuItem } from 'src/database/commands/upgrade-version-command/2-44/utils/find-add-node-workflow-command-menu-item.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const ADD_NODE_WORKFLOW_UNIVERSAL_IDENTIFIER =
  '818117fa-6cad-4ebc-83c1-40f4afc28d94';
const TIDY_UP_WORKFLOW_UNIVERSAL_IDENTIFIER =
  '1f3a3cab-161a-4775-af47-11be4d0bf411';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-27T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const buildCommandMenuItem = (
  engineComponentKey: EngineComponentKey,
): FlatCommandMenuItem => {
  const tidyUpWorkflow =
    allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
      TIDY_UP_WORKFLOW_UNIVERSAL_IDENTIFIER
    ];

  if (!isDefined(tidyUpWorkflow)) {
    throw new Error('Standard Tidy up workflow command menu item missing');
  }

  return {
    ...tidyUpWorkflow,
    universalIdentifier: ADD_NODE_WORKFLOW_UNIVERSAL_IDENTIFIER,
    engineComponentKey,
  };
};

describe('findAddNodeWorkflowCommandMenuItem', () => {
  it('returns the seeded Add a Node item', () => {
    const addNodeWorkflow = buildCommandMenuItem(
      EngineComponentKey.ADD_NODE_WORKFLOW,
    );

    expect(
      findAddNodeWorkflowCommandMenuItem({
        flatCommandMenuItemsByUniversalIdentifier: {
          [ADD_NODE_WORKFLOW_UNIVERSAL_IDENTIFIER]: addNodeWorkflow,
        },
      }),
    ).toBe(addNodeWorkflow);
  });

  it('ignores an item with the same identifier but another component', () => {
    expect(
      findAddNodeWorkflowCommandMenuItem({
        flatCommandMenuItemsByUniversalIdentifier: {
          [ADD_NODE_WORKFLOW_UNIVERSAL_IDENTIFIER]: buildCommandMenuItem(
            EngineComponentKey.TIDY_UP_WORKFLOW,
          ),
        },
      }),
    ).toBeUndefined();
  });

  it('returns nothing when the workspace no longer has the item', () => {
    expect(
      findAddNodeWorkflowCommandMenuItem({
        flatCommandMenuItemsByUniversalIdentifier: {},
      }),
    ).toBeUndefined();
  });
});
