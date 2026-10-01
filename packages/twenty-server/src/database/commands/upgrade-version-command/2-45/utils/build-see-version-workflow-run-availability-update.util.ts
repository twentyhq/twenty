import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER =
  'cc3a065c-c89e-40ac-9449-4272c55b1bb8';

const PREVIOUS_SEE_VERSION_WORKFLOW_RUN_EXPRESSION = null;

const NEXT_SEE_VERSION_WORKFLOW_RUN_EXPRESSION =
  'not featureFlags.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED';

export const buildSeeVersionWorkflowRunAvailabilityUpdate = ({
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
  const seeVersionWorkflowRun =
    flatCommandMenuItemsByUniversalIdentifier[
      SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER
    ];

  const [fromExpression, toExpression] =
    direction === 'up'
      ? [
          PREVIOUS_SEE_VERSION_WORKFLOW_RUN_EXPRESSION,
          NEXT_SEE_VERSION_WORKFLOW_RUN_EXPRESSION,
        ]
      : [
          NEXT_SEE_VERSION_WORKFLOW_RUN_EXPRESSION,
          PREVIOUS_SEE_VERSION_WORKFLOW_RUN_EXPRESSION,
        ];

  if (
    !isDefined(seeVersionWorkflowRun) ||
    (seeVersionWorkflowRun.conditionalAvailabilityExpression ?? null) !==
      fromExpression
  ) {
    return [];
  }

  return [
    {
      ...seeVersionWorkflowRun,
      conditionalAvailabilityExpression: toExpression,
      updatedAt: now,
    },
  ];
};
