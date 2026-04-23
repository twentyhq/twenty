import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/server-items/display/constants/PinnedCommandMenuItemsGap';
import { commandMenuPinnedInlineLayoutState } from '@/command-menu-item/server-items/display/states/commandMenuPinnedInlineLayoutState';
import { getVisibleCommandMenuItemCountForContainerWidth } from '@/command-menu-item/server-items/display/utils/getVisibleCommandMenuItemCountForContainerWidth';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useCallback, useMemo } from 'react';

type ElementDimensions = {
  width: number;
  height: number;
};

type UsePinnedCommandMenuItemsInlineLayoutParams = {
  pinnedCommandMenuItems: CommandMenuItemConfig[];
};

export const usePinnedCommandMenuItemsInlineLayout = ({
  pinnedCommandMenuItems,
}: UsePinnedCommandMenuItemsInlineLayoutParams) => {
  const [commandMenuPinnedInlineLayout, setCommandMenuPinnedInlineLayout] =
    useAtomState(commandMenuPinnedInlineLayoutState);

  const pinnedCommandMenuItemsSortedByPosition = useMemo(
    () =>
      [...pinnedCommandMenuItems].sort(
        (firstPinnedCommandMenuItem, secondPinnedCommandMenuItem) =>
          firstPinnedCommandMenuItem.position -
          secondPinnedCommandMenuItem.position,
      ),
    [pinnedCommandMenuItems],
  );

  const pinnedCommandMenuItemKeysInDisplayOrder = useMemo(
    () =>
      pinnedCommandMenuItemsSortedByPosition.map(
        (pinnedCommandMenuItem) => pinnedCommandMenuItem.key,
      ),
    [pinnedCommandMenuItemsSortedByPosition],
  );

  const visiblePinnedCommandMenuItemCount = useMemo(
    () =>
      getVisibleCommandMenuItemCountForContainerWidth({
        commandMenuItemKeysInDisplayOrder:
          pinnedCommandMenuItemKeysInDisplayOrder,
        commandMenuItemWidthsByKey:
          commandMenuPinnedInlineLayout.commandMenuItemWidthsByKey,
        commandMenuItemsContainerWidth:
          commandMenuPinnedInlineLayout.containerWidth,
        commandMenuItemsGapWidth: PINNED_COMMAND_MENU_ITEMS_GAP,
      }),
    [commandMenuPinnedInlineLayout, pinnedCommandMenuItemKeysInDisplayOrder],
  );

  const pinnedInlineCommandMenuItems = useMemo(
    () =>
      pinnedCommandMenuItemsSortedByPosition.slice(
        0,
        visiblePinnedCommandMenuItemCount,
      ),
    [pinnedCommandMenuItemsSortedByPosition, visiblePinnedCommandMenuItemCount],
  );

  const pinnedOverflowCommandMenuItems = useMemo(
    () =>
      pinnedCommandMenuItemsSortedByPosition.slice(
        visiblePinnedCommandMenuItemCount,
      ),
    [pinnedCommandMenuItemsSortedByPosition, visiblePinnedCommandMenuItemCount],
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
