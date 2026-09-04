import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const LEGACY_WORKFLOW_VERSION_NAVIGATION_AVAILABILITY_EXPRESSION =
  'targetObjectReadPermissions.workflowVersion';

export const buildGateWorkflowVersionNavigationCommandMenuItemUpdate = ({
  existingCommandMenuItem,
  conditionalAvailabilityExpression,
  now,
}: {
  existingCommandMenuItem: FlatCommandMenuItem | undefined;
  conditionalAvailabilityExpression: string;
  now: string;
}): FlatCommandMenuItem | undefined => {
  if (
    !isDefined(existingCommandMenuItem) ||
    existingCommandMenuItem.conditionalAvailabilityExpression !==
      LEGACY_WORKFLOW_VERSION_NAVIGATION_AVAILABILITY_EXPRESSION
  ) {
    return undefined;
  }

  return {
    ...existingCommandMenuItem,
    conditionalAvailabilityExpression,
    updatedAt: now,
  };
};
