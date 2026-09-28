import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const DEACTIVATE_WORKFLOW_UNIVERSAL_IDENTIFIER =
  '57f21a06-a17a-47b1-a123-90d90dbdf0b7';

const DEACTIVATE_WHEN_CURRENT_VERSION_IS_ACTIVE_EXPRESSION =
  'everyEquals(selectedRecords, "currentVersion.status", "ACTIVE") and noneDefined(selectedRecords, "deletedAt")';

const DEACTIVATE_WHEN_ANY_VERSION_IS_ACTIVE_EXPRESSION =
  '(everyEquals(selectedRecords, "currentVersion.status", "ACTIVE") or includesEvery(selectedRecords, "statuses", "ACTIVE")) and noneDefined(selectedRecords, "deletedAt")';

export const buildDeactivateWorkflowAvailabilityUpdate = ({
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
  const deactivateWorkflow =
    flatCommandMenuItemsByUniversalIdentifier[
      DEACTIVATE_WORKFLOW_UNIVERSAL_IDENTIFIER
    ];

  const [fromExpression, toExpression] =
    direction === 'up'
      ? [
          DEACTIVATE_WHEN_CURRENT_VERSION_IS_ACTIVE_EXPRESSION,
          DEACTIVATE_WHEN_ANY_VERSION_IS_ACTIVE_EXPRESSION,
        ]
      : [
          DEACTIVATE_WHEN_ANY_VERSION_IS_ACTIVE_EXPRESSION,
          DEACTIVATE_WHEN_CURRENT_VERSION_IS_ACTIVE_EXPRESSION,
        ];

  if (
    !isDefined(deactivateWorkflow) ||
    deactivateWorkflow.conditionalAvailabilityExpression !== fromExpression
  ) {
    return [];
  }

  return [
    {
      ...deactivateWorkflow,
      conditionalAvailabilityExpression: toExpression,
      updatedAt: now,
    },
  ];
};
