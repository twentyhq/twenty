import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const GATED_ENGINE_COMPONENT_KEYS: EngineComponentKey[] = [
  EngineComponentKey.ADD_TO_FAVORITES,
  EngineComponentKey.REMOVE_FROM_FAVORITES,
];

export const buildGateWorkflowFavoriteCommandMenuItemUpdates = ({
  flatCommandMenuItems,
  conditionalAvailabilityExpressionByEngineComponentKey,
  now,
}: {
  flatCommandMenuItems: (FlatCommandMenuItem | undefined)[];
  conditionalAvailabilityExpressionByEngineComponentKey: Partial<
    Record<EngineComponentKey, string>
  >;
  now: string;
}): FlatCommandMenuItem[] =>
  flatCommandMenuItems.flatMap((flatCommandMenuItem) => {
    if (
      !isDefined(flatCommandMenuItem) ||
      !isDefined(flatCommandMenuItem.engineComponentKey) ||
      !GATED_ENGINE_COMPONENT_KEYS.includes(
        flatCommandMenuItem.engineComponentKey,
      )
    ) {
      return [];
    }

    const conditionalAvailabilityExpression =
      conditionalAvailabilityExpressionByEngineComponentKey[
        flatCommandMenuItem.engineComponentKey
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
