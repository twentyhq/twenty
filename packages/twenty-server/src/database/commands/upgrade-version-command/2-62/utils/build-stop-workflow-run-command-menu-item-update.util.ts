import { isDefined } from 'twenty-shared/utils';

import {
  STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION,
  STOP_WORKFLOW_RUN_LEGACY_AVAILABILITY_EXPRESSION,
} from 'src/database/commands/upgrade-version-command/2-62/constants/drop-not-started-workflow-run-status.constant';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const buildStopWorkflowRunCommandMenuItemUpdate = ({
  stopCommandMenuItem,
  now,
}: {
  stopCommandMenuItem: FlatCommandMenuItem | undefined;
  now: string;
}): FlatCommandMenuItem | undefined => {
  if (
    !isDefined(stopCommandMenuItem) ||
    stopCommandMenuItem.conditionalAvailabilityExpression !==
      STOP_WORKFLOW_RUN_LEGACY_AVAILABILITY_EXPRESSION
  ) {
    return undefined;
  }

  return {
    ...stopCommandMenuItem,
    conditionalAvailabilityExpression:
      STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION,
    updatedAt: now,
  };
};
