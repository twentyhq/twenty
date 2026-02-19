import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useStore } from 'jotai';
import { Key } from 'ts-key-enum';

import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

type Direction = 'up' | 'down' | 'left' | 'right';

export const useSelectableListHotKeys = (
  instanceId: string,
  focusId: string,
  onSelect?: (itemId: string) => void,
) => {
  const findPosition = (
    selectableItemIds: string[][],
    selectedItemId?: string | null,
  ) => {
    if (!selectedItemId) {
      return;
    }

    for (let row = 0; row < selectableItemIds.length; row++) {
      const col = selectableItemIds[row].indexOf(selectedItemId);
      if (col !== -1) {
        return { row, col };
      }
    }
  };

  const store = useStore();

  const handleSelect = useCallback(
    (direction: Direction) => {
      const selectedItemId = store.get(
        selectedItemIdComponentState.atomFamily({
          instanceId: instanceId,
        }),
      );
      const selectableItemIds = store.get(
        selectableItemIdsComponentState.atomFamily({
          instanceId: instanceId,
        }),
      );

      const currentPosition = findPosition(selectableItemIds, selectedItemId);

      const computeNextId = (direction: Direction) => {
        if (
          selectableItemIds.length === 0 ||
          selectableItemIds[0]?.length === 0
        ) {
          return;
        }

        if (!selectedItemId || !currentPosition) {
          return selectableItemIds[0][0];
        }

        const { row: currentRow, col: currentCol } = currentPosition;

        const isSingleRow = selectableItemIds.length === 1;

        let nextRow: number;
        let nextCol: number;

        switch (direction) {
          case 'up':
            nextRow = isSingleRow ? currentRow : Math.max(0, currentRow - 1);
            nextCol = isSingleRow ? Math.max(0, currentCol - 1) : currentCol;
            break;
          case 'down':
            nextRow = isSingleRow
              ? currentRow
              : Math.min(selectableItemIds.length - 1, currentRow + 1);
            nextCol = isSingleRow
              ? Math.min(
                  selectableItemIds[currentRow].length - 1,
                  currentCol + 1,
                )
              : currentCol;
            break;
          case 'left':
            nextRow = currentRow;
            nextCol = Math.max(0, currentCol - 1);
            break;
          case 'right':
            nextRow = currentRow;
            nextCol = Math.min(
              selectableItemIds[currentRow].length - 1,
              currentCol + 1,
            );
            break;
          default:
            nextRow = currentRow;
            nextCol = currentCol;
        }

        return selectableItemIds[nextRow][nextCol];
      };

      const nextId = computeNextId(direction);

      if (selectedItemId !== nextId) {
        if (isNonEmptyString(nextId)) {
          store.set(
            isSelectedItemIdComponentFamilyState.atomFamily({
              instanceId: instanceId,
              familyKey: nextId,
            }),
            true,
          );
          store.set(
            selectedItemIdComponentState.atomFamily({
              instanceId: instanceId,
            }),
            nextId,
          );
          onSelect?.(nextId);
        }

        if (isNonEmptyString(selectedItemId)) {
          store.set(
            isSelectedItemIdComponentFamilyState.atomFamily({
              instanceId: instanceId,
              familyKey: selectedItemId,
            }),
            false,
          );
        }
      }
    },
    [store, instanceId, onSelect],
  );

  useHotkeysOnFocusedElement({
    keys: Key.ArrowUp,
    callback: () => handleSelect('up'),
    focusId,
    dependencies: [handleSelect],
  });

  useHotkeysOnFocusedElement({
    keys: Key.ArrowDown,
    callback: () => handleSelect('down'),
    focusId,
    dependencies: [handleSelect],
  });

  useHotkeysOnFocusedElement({
    keys: Key.ArrowLeft,
    callback: () => handleSelect('left'),
    focusId,
    dependencies: [handleSelect],
  });

  useHotkeysOnFocusedElement({
    keys: Key.ArrowRight,
    callback: () => handleSelect('right'),
    focusId,
    dependencies: [handleSelect],
  });
};
