import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const SINGLE_SELECTION_CONDITION = 'numberOfSelectedRecords == 1 and ';

const PREVIOUS_WORKFLOW_COMMAND_EXPRESSIONS = {
  activateWorkflow: {
    universalIdentifier: '44f19c85-0fd0-482f-a14e-da513c60b1b3',
    expression:
      'everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and (everyEquals(selectedRecords, "currentVersion.status", "DRAFT") or includesNone(selectedRecords, "statuses", "ACTIVE")) and noneDefined(selectedRecords, "deletedAt")',
  },
  testWorkflow: {
    universalIdentifier: 'f85d552a-87a3-4667-99f7-71b47917539c',
    expression:
      'everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and ((everyEquals(selectedRecords, "currentVersion.trigger.type", "MANUAL") and noneDefined(selectedRecords, "currentVersion.trigger.settings.objectType")) or everyEquals(selectedRecords, "currentVersion.trigger.type", "WEBHOOK") or everyEquals(selectedRecords, "currentVersion.trigger.type", "CRON")) and noneDefined(selectedRecords, "deletedAt")',
  },
  seeRunsWorkflow: {
    universalIdentifier: 'e57efc2d-00a2-493a-b76c-f2dabd23a5eb',
    expression: 'noneDefined(selectedRecords, "deletedAt")',
  },
  seeVersionsWorkflow: {
    universalIdentifier: '92781d24-b875-4282-8cdb-d127f04a5c7d',
    expression: 'noneDefined(selectedRecords, "deletedAt")',
  },
};

export const buildWorkflowCommandSingleSelectionUpdates = ({
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
}): FlatCommandMenuItem[] => {
  return Object.values(PREVIOUS_WORKFLOW_COMMAND_EXPRESSIONS).flatMap(
    ({ universalIdentifier, expression }) => {
      const commandMenuItem =
        flatCommandMenuItemsByUniversalIdentifier[universalIdentifier];
      const nextExpression = `${SINGLE_SELECTION_CONDITION}${expression}`;
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
};
