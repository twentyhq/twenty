import { isDefined } from 'twenty-shared/utils';

import { buildWorkflowCommandUpdatePermissionUpdates } from 'src/database/commands/upgrade-version-command/2-44/utils/build-workflow-command-update-permission-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-09-30T12:00:00.000Z';
const RECORD_UPDATE_PERMISSION_CONDITION =
  ' and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)';
const WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS = [
  '57f21a06-a17a-47b1-a123-90d90dbdf0b7',
  '91094438-b4c2-46ad-a23b-8af4b23ba514',
  '1f3a3cab-161a-4775-af47-11be4d0bf411',
  '26f98606-8b6e-42f2-bc97-2cfc4359bada',
];

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-27T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const getStandardItem = (universalIdentifier: string): FlatCommandMenuItem => {
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

const withPreviousExpressions = () => {
  return Object.fromEntries(
    WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.map((universalIdentifier) => {
      const standardItem = getStandardItem(universalIdentifier);

      return [
        universalIdentifier,
        {
          ...standardItem,
          conditionalAvailabilityExpression:
            standardItem.conditionalAvailabilityExpression?.replace(
              RECORD_UPDATE_PERMISSION_CONDITION,
              '',
            ) ?? null,
        },
      ];
    }),
  );
};

describe('buildWorkflowCommandUpdatePermissionUpdates', () => {
  it('moves the workflow commands to the current standard expressions', () => {
    const updates = buildWorkflowCommandUpdatePermissionUpdates({
      flatCommandMenuItemsByUniversalIdentifier: withPreviousExpressions(),
      now: NOW,
      direction: 'up',
    });

    expect(updates).toHaveLength(WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.length);
    for (const update of updates) {
      expect(update.conditionalAvailabilityExpression).toBe(
        getStandardItem(update.universalIdentifier)
          .conditionalAvailabilityExpression,
      );
      expect(update.updatedAt).toBe(NOW);
    }
  });

  it('leaves customized expressions untouched', () => {
    const items = withPreviousExpressions();
    const [customizedUniversalIdentifier] =
      WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS;
    const customized = items[customizedUniversalIdentifier];

    if (!isDefined(customized)) {
      throw new Error('Expected a workflow command');
    }

    items[customizedUniversalIdentifier] = {
      ...customized,
      conditionalAvailabilityExpression: 'numberOfSelectedRecords == 1',
    };

    const updates = buildWorkflowCommandUpdatePermissionUpdates({
      flatCommandMenuItemsByUniversalIdentifier: items,
      now: NOW,
      direction: 'up',
    });

    expect(
      updates.map(({ universalIdentifier }) => universalIdentifier),
    ).not.toContain(customizedUniversalIdentifier);
    expect(updates).toHaveLength(
      WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.length - 1,
    );
  });

  it('restores the previous expressions on down', () => {
    const standardItems = Object.fromEntries(
      WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.map((universalIdentifier) => [
        universalIdentifier,
        getStandardItem(universalIdentifier),
      ]),
    );
    const previousItems = withPreviousExpressions();

    const updates = buildWorkflowCommandUpdatePermissionUpdates({
      flatCommandMenuItemsByUniversalIdentifier: standardItems,
      now: NOW,
      direction: 'down',
    });

    expect(updates).toHaveLength(WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.length);
    for (const update of updates) {
      expect(update.conditionalAvailabilityExpression).toBe(
        previousItems[update.universalIdentifier]
          ?.conditionalAvailabilityExpression,
      );
    }
  });
});
