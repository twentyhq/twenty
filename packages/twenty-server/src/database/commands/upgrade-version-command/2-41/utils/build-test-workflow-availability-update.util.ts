import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

export const LEGACY_TEST_WORKFLOW_AVAILABILITY_EXPRESSION =
  'everyDefined(selectedRecords, "currentVersion.trigger") and everyDefined(selectedRecords, "currentVersion.steps") and every(selectedRecords, "currentVersion.steps.length") and ((everyEquals(selectedRecords, "currentVersion.trigger.type", "MANUAL") and noneDefined(selectedRecords, "currentVersion.trigger.settings.objectType")) or everyEquals(selectedRecords, "currentVersion.trigger.type", "WEBHOOK") or everyEquals(selectedRecords, "currentVersion.trigger.type", "CRON")) and noneDefined(selectedRecords, "deletedAt")';

const TEST_WORKFLOW_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.testWorkflow.universalIdentifier;

export const buildTestWorkflowAvailabilityUpdate = ({
  flatCommandMenuItemByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
}): FlatCommandMenuItem[] => {
  const existingCommandMenuItem =
    flatCommandMenuItemByUniversalIdentifier[
      TEST_WORKFLOW_UNIVERSAL_IDENTIFIER
    ];

  if (!isDefined(existingCommandMenuItem)) {
    return [];
  }

  // A workspace that edited the expression itself keeps its own version
  if (
    existingCommandMenuItem.conditionalAvailabilityExpression !==
    LEGACY_TEST_WORKFLOW_AVAILABILITY_EXPRESSION
  ) {
    return [];
  }

  return [
    {
      ...existingCommandMenuItem,
      conditionalAvailabilityExpression:
        STANDARD_COMMAND_MENU_ITEMS.testWorkflow
          .conditionalAvailabilityExpression,
      updatedAt: now,
    },
  ];
};
