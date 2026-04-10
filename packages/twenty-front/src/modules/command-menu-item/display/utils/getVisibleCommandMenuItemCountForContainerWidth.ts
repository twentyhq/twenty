type GetVisibleCommandMenuItemCountForContainerWidthParams = {
  commandMenuItemKeysInDisplayOrder: string[];
  commandMenuItemWidthsByKey: Record<string, number>;
  commandMenuItemsContainerWidth: number;
  commandMenuItemsGapWidth: number;
};

export const getVisibleCommandMenuItemCountForContainerWidth = ({
  commandMenuItemKeysInDisplayOrder,
  commandMenuItemWidthsByKey,
  commandMenuItemsContainerWidth,
  commandMenuItemsGapWidth,
}: GetVisibleCommandMenuItemCountForContainerWidthParams): number => {
  if (commandMenuItemsContainerWidth <= 0) {
    return commandMenuItemKeysInDisplayOrder.length;
  }

  let usedWidth = 0;
  let visibleCommandMenuItemCount = 0;

  for (const commandMenuItemKey of commandMenuItemKeysInDisplayOrder) {
    const commandMenuItemWidth = commandMenuItemWidthsByKey[commandMenuItemKey];

    if (typeof commandMenuItemWidth !== 'number') {
      return commandMenuItemKeysInDisplayOrder.length;
    }

    const nextWidth =
      visibleCommandMenuItemCount === 0
        ? commandMenuItemWidth
        : usedWidth + commandMenuItemsGapWidth + commandMenuItemWidth;

    if (nextWidth > commandMenuItemsContainerWidth) {
      break;
    }

    usedWidth = nextWidth;
    visibleCommandMenuItemCount += 1;
  }

  return visibleCommandMenuItemCount;
};
