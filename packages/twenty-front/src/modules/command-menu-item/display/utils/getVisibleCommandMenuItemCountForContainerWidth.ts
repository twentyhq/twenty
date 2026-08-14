type GetVisibleCommandMenuItemCountForContainerWidthParams = {
  commandMenuItemKeysInDisplayOrder: string[];
  commandMenuItemWidthsByKey: Record<string, number>;
  commandMenuItemsContainerWidth: number;
  commandMenuItemsGapWidth: number;
  commandMenuItemsLeadingActionWidth?: number;
};

export const getVisibleCommandMenuItemCountForContainerWidth = ({
  commandMenuItemKeysInDisplayOrder,
  commandMenuItemWidthsByKey,
  commandMenuItemsContainerWidth,
  commandMenuItemsGapWidth,
  commandMenuItemsLeadingActionWidth = 0,
}: GetVisibleCommandMenuItemCountForContainerWidthParams): number => {
  if (commandMenuItemsContainerWidth <= 0) {
    return commandMenuItemKeysInDisplayOrder.length;
  }

  // A leading action shares the container with the items and is separated from
  // them by one gap, so its footprint is reserved before fitting the items.
  const availableContainerWidth =
    commandMenuItemsLeadingActionWidth > 0
      ? commandMenuItemsContainerWidth -
        commandMenuItemsLeadingActionWidth -
        commandMenuItemsGapWidth
      : commandMenuItemsContainerWidth;

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

    if (nextWidth > availableContainerWidth) {
      break;
    }

    usedWidth = nextWidth;
    visibleCommandMenuItemCount += 1;
  }

  return visibleCommandMenuItemCount;
};
