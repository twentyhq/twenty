import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const buildGateWorkflowFavoriteCommandMenuItemUpdates = ({
  flatCommandMenuItems,
  conditionalAvailabilityExpressionByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItems: (FlatCommandMenuItem | undefined)[];
  conditionalAvailabilityExpressionByUniversalIdentifier: Record<
    string,
    string
  >;
  now: string;
}): FlatCommandMenuItem[] =>
  flatCommandMenuItems.flatMap((flatCommandMenuItem) => {
    if (!isDefined(flatCommandMenuItem)) {
      return [];
    }

    const conditionalAvailabilityExpression =
      conditionalAvailabilityExpressionByUniversalIdentifier[
        flatCommandMenuItem.universalIdentifier
      ];

    if (
      !isDefined(conditionalAvailabilityExpression) ||
      flatCommandMenuItem.conditionalAvailabilityExpression ===
        conditionalAvailabilityExpression
    ) {
      return [];
    }

    return [
      {
        ...flatCommandMenuItem,
        conditionalAvailabilityExpression,
        updatedAt: now,
      },
    ];
  });
