import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/display/constants/PinnedCommandMenuItemsGap';
import { commandMenuPinnedInlineLayoutFamilyState } from '@/command-menu-item/display/states/commandMenuPinnedInlineLayoutFamilyState';
import { type PinnedCommandMenuItemsLayoutKey } from '@/command-menu-item/display/types/PinnedCommandMenuItemsLayoutKey';
import { getVisibleCommandMenuItemCountForContainerWidth } from '@/command-menu-item/display/utils/getVisibleCommandMenuItemCountForContainerWidth';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { isNumber } from '@sniptt/guards';
import { useCallback, useMemo } from 'react';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type ElementDimensions = {
  width: number;
  height: number;
};

type UsePinnedCommandMenuItemsInlineLayoutParams = {
  pinnedCommandMenuItems: CommandMenuItemFieldsFragment[];
  layoutKey: PinnedCommandMenuItemsLayoutKey;
  // Overrides the self-measured width when an ancestor already knows the space the inline buttons may take.
  containerWidth?: number;
};

export const usePinnedCommandMenuItemsInlineLayout = ({
  pinnedCommandMenuItems,
  layoutKey,
  containerWidth,
}: UsePinnedCommandMenuItemsInlineLayoutParams) => {
  const [commandMenuPinnedInlineLayout, setCommandMenuPinnedInlineLayout] =
    useAtomFamilyState(commandMenuPinnedInlineLayoutFamilyState, layoutKey);

  const effectiveContainerWidth =
    containerWidth ?? commandMenuPinnedInlineLayout.containerWidth;

  const commandMenuItemIdsInDisplayOrder = pinnedCommandMenuItems.map(
    ({ id }) => id,
  );
  const isLayoutKnown =
    effectiveContainerWidth > 0 &&
    commandMenuItemIdsInDisplayOrder.every((commandMenuItemId) =>
      isNumber(
        commandMenuPinnedInlineLayout.commandMenuItemWidthsByKey[
          commandMenuItemId
        ],
      ),
    );

  const visiblePinnedCommandMenuItemCount = isLayoutKnown
    ? getVisibleCommandMenuItemCountForContainerWidth({
        commandMenuItemKeysInDisplayOrder: commandMenuItemIdsInDisplayOrder,
        commandMenuItemWidthsByKey:
          commandMenuPinnedInlineLayout.commandMenuItemWidthsByKey,
        commandMenuItemsContainerWidth: effectiveContainerWidth,
        commandMenuItemsGapWidth: PINNED_COMMAND_MENU_ITEMS_GAP,
      })
    : 0;

  const pinnedInlineCommandMenuItems = useMemo(
    () => pinnedCommandMenuItems.slice(0, visiblePinnedCommandMenuItemCount),
    [pinnedCommandMenuItems, visiblePinnedCommandMenuItemCount],
  );

  const pinnedOverflowCommandMenuItems = useMemo(
    () => pinnedCommandMenuItems.slice(visiblePinnedCommandMenuItemCount),
    [pinnedCommandMenuItems, visiblePinnedCommandMenuItemCount],
  );

  const onContainerDimensionChange = useCallback(
    (dimensions: ElementDimensions) => {
      setCommandMenuPinnedInlineLayout(
        (previousCommandMenuPinnedInlineLayout) =>
          previousCommandMenuPinnedInlineLayout.containerWidth !==
          dimensions.width
            ? {
                ...previousCommandMenuPinnedInlineLayout,
                containerWidth: dimensions.width,
              }
            : previousCommandMenuPinnedInlineLayout,
      );
    },
    [setCommandMenuPinnedInlineLayout],
  );

  const onCommandMenuItemDimensionChange = useCallback(
    (commandMenuItemKey: string) => (dimensions: ElementDimensions) => {
      setCommandMenuPinnedInlineLayout(
        (previousCommandMenuPinnedInlineLayout) =>
          previousCommandMenuPinnedInlineLayout.commandMenuItemWidthsByKey[
            commandMenuItemKey
          ] !== dimensions.width
            ? {
                ...previousCommandMenuPinnedInlineLayout,
                commandMenuItemWidthsByKey: {
                  ...previousCommandMenuPinnedInlineLayout.commandMenuItemWidthsByKey,
                  [commandMenuItemKey]: dimensions.width,
                },
              }
            : previousCommandMenuPinnedInlineLayout,
      );
    },
    [setCommandMenuPinnedInlineLayout],
  );

  return {
    pinnedInlineCommandMenuItems,
    pinnedOverflowCommandMenuItems,
    onContainerDimensionChange,
    onCommandMenuItemDimensionChange,
  };
};
