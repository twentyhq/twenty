import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const WORKFLOW_CORE_INDEX_FLAG_EXPRESSION =
  'featureFlags.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED';

const FAVORITES_EXPRESSION_PREFIXES = [
  'arrayLength(favoriteRecordIds) < numberOfSelectedRecords',
  'arrayLength(favoriteRecordIds) == numberOfSelectedRecords',
];

const FAVORITES_EXPRESSION_SUFFIX =
  ' and noneDefined(selectedRecords, "deletedAt") and not hasAnySoftDeleteFilterOnView and objectMetadataItem.nameSingular != "messageCampaign"';

const FLAGGED_FAVORITES_WORKFLOW_CONDITION = ` and not (${WORKFLOW_CORE_INDEX_FLAG_EXPRESSION} and objectMetadataItem.nameSingular == "workflow")`;

const FAVORITES_WORKFLOW_CONDITION =
  ' and objectMetadataItem.nameSingular != "workflow"';

const FLAGGED_WORKFLOW_VERSION_NAVIGATION_EXPRESSION = `not ${WORKFLOW_CORE_INDEX_FLAG_EXPRESSION} and targetObjectReadPermissions.workflowVersion`;

const HIDDEN_WORKFLOW_VERSION_NAVIGATION_EXPRESSION = 'false';

const FAVORITES_EXPRESSION_REPLACEMENTS = FAVORITES_EXPRESSION_PREFIXES.map(
  (prefix) => ({
    flaggedExpression: `${prefix}${FAVORITES_EXPRESSION_SUFFIX}${FLAGGED_FAVORITES_WORKFLOW_CONDITION}`,
    unflaggedExpression: `${prefix}${FAVORITES_EXPRESSION_SUFFIX}${FAVORITES_WORKFLOW_CONDITION}`,
  }),
);

const isWorkflowVersionNavigation = (commandMenuItem: FlatCommandMenuItem) =>
  commandMenuItem.navigationTargetObjectMetadataUniversalIdentifier ===
  STANDARD_OBJECTS.workflowVersion.universalIdentifier;

const isApplicationWorkflowCommand = (commandMenuItem: FlatCommandMenuItem) =>
  commandMenuItem.engineComponentKey ===
    EngineComponentKey.TRIGGER_WORKFLOW_VERSION &&
  commandMenuItem.isSystemSideEffect;

const computeUnflaggedExpression = (
  commandMenuItem: FlatCommandMenuItem,
): string | null | undefined => {
  const expression = commandMenuItem.conditionalAvailabilityExpression;

  if (
    !isDefined(expression) ||
    !expression.includes(WORKFLOW_CORE_INDEX_FLAG_EXPRESSION)
  ) {
    return undefined;
  }

  if (expression === WORKFLOW_CORE_INDEX_FLAG_EXPRESSION) {
    return null;
  }

  if (expression === FLAGGED_WORKFLOW_VERSION_NAVIGATION_EXPRESSION) {
    return HIDDEN_WORKFLOW_VERSION_NAVIGATION_EXPRESSION;
  }

  const favoritesReplacement = FAVORITES_EXPRESSION_REPLACEMENTS.find(
    ({ flaggedExpression }) => flaggedExpression === expression,
  );

  return (
    favoritesReplacement?.unflaggedExpression ??
    expression.split(WORKFLOW_CORE_INDEX_FLAG_EXPRESSION).join('true')
  );
};

const computeFlaggedExpression = (
  commandMenuItem: FlatCommandMenuItem,
): string | undefined => {
  if (
    isApplicationWorkflowCommand(commandMenuItem) &&
    !isDefined(commandMenuItem.conditionalAvailabilityExpression)
  ) {
    return WORKFLOW_CORE_INDEX_FLAG_EXPRESSION;
  }

  if (
    isWorkflowVersionNavigation(commandMenuItem) &&
    commandMenuItem.conditionalAvailabilityExpression ===
      HIDDEN_WORKFLOW_VERSION_NAVIGATION_EXPRESSION
  ) {
    return FLAGGED_WORKFLOW_VERSION_NAVIGATION_EXPRESSION;
  }

  return FAVORITES_EXPRESSION_REPLACEMENTS.find(
    ({ unflaggedExpression }) =>
      unflaggedExpression === commandMenuItem.conditionalAvailabilityExpression,
  )?.flaggedExpression;
};

export const buildRemoveWorkflowCoreIndexFlagCommandMenuItemUpdates = ({
  flatCommandMenuItems,
  now,
  direction,
}: {
  flatCommandMenuItems: (FlatCommandMenuItem | undefined)[];
  now: string;
  direction: 'up' | 'down';
}): FlatCommandMenuItem[] =>
  flatCommandMenuItems.flatMap((commandMenuItem) => {
    if (!isDefined(commandMenuItem)) {
      return [];
    }

    const nextExpression =
      direction === 'up'
        ? computeUnflaggedExpression(commandMenuItem)
        : computeFlaggedExpression(commandMenuItem);

    if (nextExpression === undefined) {
      return [];
    }

    return [
      {
        ...commandMenuItem,
        conditionalAvailabilityExpression: nextExpression,
        updatedAt: now,
      },
    ];
  });
