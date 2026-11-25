import { isDefined } from 'twenty-shared/utils';

import { buildWorkflowCommandUpdatePermissionUpdates } from 'src/database/commands/upgrade-version-command/2-45/utils/build-workflow-command-update-permission-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-09-30T12:00:00.000Z';
const RECORD_UPDATE_PERMISSION_CONDITION =
  ' and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)';
const PREVIOUS_EXPRESSION_BY_UNIVERSAL_IDENTIFIER: Record<string, string> = {
  '57f21a06-a17a-47b1-a123-90d90dbdf0b7':
    'numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "currentVersion.status", "ACTIVE") or includesEvery(selectedRecords, "statuses", "ACTIVE")) and noneDefined(selectedRecords, "deletedAt")',
  '91094438-b4c2-46ad-a23b-8af4b23ba514':
    'everyDefined(selectedRecords, "currentVersion") and noneDefined(selectedRecords, "deletedAt")',
  '1f3a3cab-161a-4775-af47-11be4d0bf411':
    'pageType == "RECORD_PAGE" and everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and noneDefined(selectedRecords, "deletedAt")',
  '26f98606-8b6e-42f2-bc97-2cfc4359bada':
    'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "visibility", "WORKSPACE") and every(selectedRecords, "canChangeVisibility") and noneDefined(selectedRecords, "deletedAt")',
};
const WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS = Object.keys(
  PREVIOUS_EXPRESSION_BY_UNIVERSAL_IDENTIFIER,
);

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-27T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const buildItems = (
  computeExpression: (previousExpression: string) => string,
): Record<string, FlatCommandMenuItem> =>
  Object.fromEntries(
    Object.entries(PREVIOUS_EXPRESSION_BY_UNIVERSAL_IDENTIFIER).map(
      ([universalIdentifier, previousExpression]) => {
        const commandMenuItem =
          allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        if (!isDefined(commandMenuItem)) {
          throw new Error(
            `Standard command menu item ${universalIdentifier} missing`,
          );
        }

        return [
          universalIdentifier,
          {
            ...commandMenuItem,
            conditionalAvailabilityExpression:
              computeExpression(previousExpression),
          },
        ];
      },
    ),
  );

const withPreviousExpressions = () =>
  buildItems((previousExpression) => previousExpression);

const withUpdatedExpressions = () =>
  buildItems(
    (previousExpression) =>
      `${previousExpression}${RECORD_UPDATE_PERMISSION_CONDITION}`,
  );

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
        `${PREVIOUS_EXPRESSION_BY_UNIVERSAL_IDENTIFIER[update.universalIdentifier]}${RECORD_UPDATE_PERMISSION_CONDITION}`,
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

    const updates = buildWorkflowCommandUpdatePermissionUpdates({
      flatCommandMenuItemsByUniversalIdentifier: withUpdatedExpressions(),
      now: NOW,
      direction: 'down',
    });

    expect(updates).toHaveLength(WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.length);
    for (const update of updates) {
      expect(update.conditionalAvailabilityExpression).toBe(
        PREVIOUS_EXPRESSION_BY_UNIVERSAL_IDENTIFIER[update.universalIdentifier],
      );
    }
  });
});
