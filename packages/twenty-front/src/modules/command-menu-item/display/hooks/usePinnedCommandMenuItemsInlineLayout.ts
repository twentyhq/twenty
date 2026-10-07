import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/display/constants/PinnedCommandMenuItemsGap';
import { commandMenuPinnedInlineLayoutFamilyState } from '@/command-menu-item/display/states/commandMenuPinnedInlineLayoutFamilyState';
import { type PinnedCommandMenuItemsLayoutKey } from '@/command-menu-item/display/types/PinnedCommandMenuItemsLayoutKey';
import { getCommandMenuItemButtonHotKey } from '@/command-menu-item/display/utils/getCommandMenuItemButtonHotKey';
import { getPinnedCommandMenuItemWidthKey } from '@/command-menu-item/display/utils/getPinnedCommandMenuItemWidthKey';
import { getVisibleCommandMenuItemCountForContainerWidth } from '@/command-menu-item/display/utils/getVisibleCommandMenuItemCountForContainerWidth';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { isNumber } from '@sniptt/guards';
import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
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

  const getVisiblePinnedCommandMenuItemCount = (shouldShowHotKeys: boolean) => {
    const widthKeysInDisplayOrder = pinnedCommandMenuItems.map((item) =>
      getPinnedCommandMenuItemWidthKey({
        commandMenuItemId: item.id,
        shouldShowHotKey:
          shouldShowHotKeys || !isDefined(getCommandMenuItemButtonHotKey(item)),
      }),
    );
    const isLayoutKnown =
      effectiveContainerWidth > 0 &&
      widthKeysInDisplayOrder.every((widthKey) =>
        isNumber(
          commandMenuPinnedInlineLayout.commandMenuItemWidthsByKey[widthKey],
        ),
      );

    return isLayoutKnown
      ? getVisibleCommandMenuItemCountForContainerWidth({
          commandMenuItemKeysInDisplayOrder: widthKeysInDisplayOrder,
          commandMenuItemWidthsByKey:
            commandMenuPinnedInlineLayout.commandMenuItemWidthsByKey,
          commandMenuItemsContainerWidth: effectiveContainerWidth,
          commandMenuItemsGapWidth: PINNED_COMMAND_MENU_ITEMS_GAP,
        })
      : 0;
  };

  const visiblePinnedCommandMenuItemCountWithHotKeys =
    getVisiblePinnedCommandMenuItemCount(true);
  const visiblePinnedCommandMenuItemCountWithoutHotKeys =
    getVisiblePinnedCommandMenuItemCount(false);

  const shouldShowHotKeys =
    visiblePinnedCommandMenuItemCountWithHotKeys >=
    visiblePinnedCommandMenuItemCountWithoutHotKeys;

  const visiblePinnedCommandMenuItemCount = shouldShowHotKeys
    ? visiblePinnedCommandMenuItemCountWithHotKeys
    : visiblePinnedCommandMenuItemCountWithoutHotKeys;

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
    shouldShowHotKeys,
    onContainerDimensionChange,
    onCommandMenuItemDimensionChange,
  };
};
