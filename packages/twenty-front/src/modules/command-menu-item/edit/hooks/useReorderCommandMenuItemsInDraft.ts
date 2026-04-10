import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { computeInsertPositionFromBounds } from '@/command-menu-item/edit/utils/computeInsertPositionFromBounds';
import { getPositionBoundsAtInsertionPoint } from '@/command-menu-item/edit/utils/getPositionBoundsAtInsertionPoint';

export const useReorderCommandMenuItemsInDraft = () => {
  const store = useStore();

  const reorderCommandMenuItemInDraft = useCallback(
    (
      sourceId: string,
      destinationIndex: number,
      targetSection: 'pinned' | 'other',
      contextualItemIds?: ReadonlySet<string>,
    ) => {
      const draft = store.get(commandMenuItemsDraftState.atom);

      if (!isDefined(draft)) {
        return;
      }

      const isPinned = targetSection === 'pinned';

      const fullSectionItems = draft
        .filter((item) => item.isPinned === isPinned)
        .sort((a, b) => a.position - b.position);

      const contextualSectionItems = isDefined(contextualItemIds)
        ? fullSectionItems.filter((item) => contextualItemIds.has(item.id))
        : fullSectionItems;

      const fullSectionItemsWithoutSource = fullSectionItems.filter(
        (item) => item.id !== sourceId,
      );
      const contextualSectionItemsWithoutSource = contextualSectionItems.filter(
        (item) => item.id !== sourceId,
      );

      const clampedDestinationIndex = Math.max(
        0,
        Math.min(destinationIndex, contextualSectionItemsWithoutSource.length),
      );

      const nextContextualItem =
        contextualSectionItemsWithoutSource[clampedDestinationIndex];
      const previousContextualItem =
        contextualSectionItemsWithoutSource[clampedDestinationIndex - 1];

      if (
        !isDefined(nextContextualItem) &&
        !isDefined(previousContextualItem)
      ) {
        return;
      }

      const positionBounds = isDefined(nextContextualItem)
        ? getPositionBoundsAtInsertionPoint(
            nextContextualItem.id,
            'before',
            fullSectionItemsWithoutSource,
          )
        : getPositionBoundsAtInsertionPoint(
            previousContextualItem!.id,
            'after',
            fullSectionItemsWithoutSource,
          );

      if (!isDefined(positionBounds)) {
        return;
      }

      const newPosition = computeInsertPositionFromBounds(
        positionBounds.previousPosition,
        positionBounds.nextPosition,
      );

      const updatedDraft = draft.map((item) =>
        item.id === sourceId
          ? { ...item, isPinned, position: newPosition }
          : item,
      );

      store.set(commandMenuItemsDraftState.atom, updatedDraft);
    },
    [store],
  );

  return { reorderCommandMenuItemInDraft };
};
