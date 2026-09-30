import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const RECORD_UPDATE_PERMISSION_CONDITION =
  ' and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)';

const PREVIOUS_WORKFLOW_COMMAND_EXPRESSIONS = {
  deactivateWorkflow: {
    universalIdentifier: '57f21a06-a17a-47b1-a123-90d90dbdf0b7',
    expression:
      'numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "currentVersion.status", "ACTIVE") or includesEvery(selectedRecords, "statuses", "ACTIVE")) and noneDefined(selectedRecords, "deletedAt")',
  },
  duplicateWorkflow: {
    universalIdentifier: '91094438-b4c2-46ad-a23b-8af4b23ba514',
    expression:
      'everyDefined(selectedRecords, "currentVersion") and noneDefined(selectedRecords, "deletedAt")',
  },
  tidyUpWorkflow: {
    universalIdentifier: '1f3a3cab-161a-4775-af47-11be4d0bf411',
    expression:
      'pageType == "RECORD_PAGE" and everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and noneDefined(selectedRecords, "deletedAt")',
  },
  toggleWorkflowVisibility: {
    universalIdentifier: '26f98606-8b6e-42f2-bc97-2cfc4359bada',
    expression:
      'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "visibility", "WORKSPACE") and every(selectedRecords, "canChangeVisibility") and noneDefined(selectedRecords, "deletedAt")',
  },
};

export const buildWorkflowCommandUpdatePermissionUpdates = ({
  flatCommandMenuItemsByUniversalIdentifier,
  now,
  direction,
}: {
  flatCommandMenuItemsByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
  direction: 'up' | 'down';
}): FlatCommandMenuItem[] =>
  Object.values(PREVIOUS_WORKFLOW_COMMAND_EXPRESSIONS).flatMap(
    ({ universalIdentifier, expression }) => {
      const commandMenuItem =
        flatCommandMenuItemsByUniversalIdentifier[universalIdentifier];
      const nextExpression = `${expression}${RECORD_UPDATE_PERMISSION_CONDITION}`;
      const [fromExpression, toExpression] =
        direction === 'up'
          ? [expression, nextExpression]
          : [nextExpression, expression];

      if (
        !isDefined(commandMenuItem) ||
        commandMenuItem.conditionalAvailabilityExpression !== fromExpression
      ) {
        return [];
      }

      return [
        {
          ...commandMenuItem,
          conditionalAvailabilityExpression: toExpression,
          updatedAt: now,
        },
      ];
    },
  );
