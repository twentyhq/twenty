import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  CORE_WORKFLOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
  CORE_WORKFLOW_CONTEXT_EXPRESSION,
  CORE_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX,
  FAVORITE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
  LEGACY_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX,
} from 'src/database/commands/upgrade-version-command/2-46/constants/legacy-workflow-object-universal-identifiers.constant';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const prefixWithCoreWorkflowContext = (expression: string | null): string => {
  if (!isNonEmptyString(expression)) {
    return CORE_WORKFLOW_CONTEXT_EXPRESSION;
  }

  return expression.startsWith(CORE_WORKFLOW_CONTEXT_EXPRESSION)
    ? expression
    : `${CORE_WORKFLOW_CONTEXT_EXPRESSION} and ${expression}`;
};

export const buildCoreWorkflowCommandMenuItemUpdates = ({
  flatCommandMenuItemsByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemsByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
}): FlatCommandMenuItem[] => {
  const workflowItemUpdates =
    CORE_WORKFLOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.flatMap(
      (universalIdentifier) => {
        const commandMenuItem =
          flatCommandMenuItemsByUniversalIdentifier[universalIdentifier];

        if (!isDefined(commandMenuItem)) {
          return [];
        }

        const conditionalAvailabilityExpression = prefixWithCoreWorkflowContext(
          commandMenuItem.conditionalAvailabilityExpression,
        );

        if (
          !isDefined(commandMenuItem.availabilityObjectMetadataId) &&
          conditionalAvailabilityExpression ===
            commandMenuItem.conditionalAvailabilityExpression
        ) {
          return [];
        }

        return [
          {
            ...commandMenuItem,
            availabilityObjectMetadataId: null,
            availabilityObjectMetadataUniversalIdentifier: null,
            conditionalAvailabilityExpression,
            updatedAt: now,
          },
        ];
      },
    );

  const favoriteItemUpdates =
    FAVORITE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.flatMap(
      (universalIdentifier) => {
        const commandMenuItem =
          flatCommandMenuItemsByUniversalIdentifier[universalIdentifier];

        if (
          !isDefined(commandMenuItem) ||
          !isNonEmptyString(
            commandMenuItem.conditionalAvailabilityExpression,
          ) ||
          !commandMenuItem.conditionalAvailabilityExpression.includes(
            LEGACY_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX,
          )
        ) {
          return [];
        }

        return [
          {
            ...commandMenuItem,
            conditionalAvailabilityExpression:
              commandMenuItem.conditionalAvailabilityExpression.replace(
                LEGACY_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX,
                CORE_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX,
              ),
            updatedAt: now,
          },
        ];
      },
    );

  return [...workflowItemUpdates, ...favoriteItemUpdates];
};
