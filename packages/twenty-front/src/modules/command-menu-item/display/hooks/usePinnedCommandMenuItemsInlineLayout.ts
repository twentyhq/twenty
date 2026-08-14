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
};

export const usePinnedCommandMenuItemsInlineLayout = ({
  pinnedCommandMenuItems,
  layoutKey,
}: UsePinnedCommandMenuItemsInlineLayoutParams) => {
  const [commandMenuPinnedInlineLayout, setCommandMenuPinnedInlineLayout] =
    useAtomFamilyState(commandMenuPinnedInlineLayoutFamilyState, layoutKey);

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
            commandMenuItemsLeadingActionWidth:
              commandMenuPinnedInlineLayout.leadingActionWidth,
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

  const onLeadingActionDimensionChange = useCallback(
    (dimensions: ElementDimensions) => {
      setCommandMenuPinnedInlineLayout(
        (previousCommandMenuPinnedInlineLayout) =>
          previousCommandMenuPinnedInlineLayout.leadingActionWidth !==
          dimensions.width
            ? {
                ...previousCommandMenuPinnedInlineLayout,
                leadingActionWidth: dimensions.width,
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
    onLeadingActionDimensionChange,
    onCommandMenuItemDimensionChange,
  };
};
