import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/display/constants/PinnedCommandMenuItemsGap';
import { commandMenuPinnedInlineLayoutState } from '@/command-menu-item/display/states/commandMenuPinnedInlineLayoutState';
import { getVisibleCommandMenuItemCountForContainerWidth } from '@/command-menu-item/display/utils/getVisibleCommandMenuItemCountForContainerWidth';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { isNumber } from '@sniptt/guards';
import { useCallback, useMemo } from 'react';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type ElementDimensions = {
  width: number;
  height: number;
};

type UsePinnedCommandMenuItemsInlineLayoutParams = {
  pinnedCommandMenuItems: CommandMenuItemFieldsFragment[];
};

export const usePinnedCommandMenuItemsInlineLayout = ({
  pinnedCommandMenuItems,
}: UsePinnedCommandMenuItemsInlineLayoutParams) => {
  const [commandMenuPinnedInlineLayout, setCommandMenuPinnedInlineLayout] =
    useAtomState(commandMenuPinnedInlineLayoutState);

  const pinnedCommandMenuItemKeysInDisplayOrder = useMemo(
    () => pinnedCommandMenuItems.map((item) => item.id),
    [pinnedCommandMenuItems],
  );

  const hasKnownPinnedInlineLayout = useMemo(
    () =>
      commandMenuPinnedInlineLayout.containerWidth > 0 &&
      pinnedCommandMenuItemKeysInDisplayOrder.every((commandMenuItemKey) =>
        isNumber(
          commandMenuPinnedInlineLayout.commandMenuItemWidthsByKey[
            commandMenuItemKey
          ],
        ),
      ),
    [commandMenuPinnedInlineLayout, pinnedCommandMenuItemKeysInDisplayOrder],
  );

  const visiblePinnedCommandMenuItemCount = useMemo(
    () =>
      hasKnownPinnedInlineLayout
        ? getVisibleCommandMenuItemCountForContainerWidth({
            commandMenuItemKeysInDisplayOrder:
              pinnedCommandMenuItemKeysInDisplayOrder,
            commandMenuItemWidthsByKey:
              commandMenuPinnedInlineLayout.commandMenuItemWidthsByKey,
            commandMenuItemsContainerWidth:
              commandMenuPinnedInlineLayout.containerWidth,
            commandMenuItemsGapWidth: PINNED_COMMAND_MENU_ITEMS_GAP,
          })
        : 0,
    [
      commandMenuPinnedInlineLayout,
      hasKnownPinnedInlineLayout,
      pinnedCommandMenuItemKeysInDisplayOrder,
    ],
  );

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
