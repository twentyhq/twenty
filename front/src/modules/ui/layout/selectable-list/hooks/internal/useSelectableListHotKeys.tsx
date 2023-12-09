import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

import { getSelectableListScopedStates } from '@/ui/layout/selectable-list/utils/internal/getSelectableListScopedStates';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

type Direction = 'up' | 'down' | 'left' | 'right';

export const useSelectableListHotKeys = (
  scopeId: string,
  hotkeyScope: string,
) => {
  const findPosition = (
    selectableItemIds: string[][],
    selectedItemId?: string | null,
  ) => {
    if (!selectedItemId) {
      // If nothing is selected, return the default position
      return { row: 0, col: 0 };
    }

    for (let row = 0; row < selectableItemIds.length; row++) {
      const col = selectableItemIds[row].indexOf(selectedItemId);
      if (col !== -1) {
        return { row, col };
      }
    }
    return { row: 0, col: 0 };
  };

  const handleSelect = useRecoilCallback(
    ({ snapshot, set }) =>
      (direction: Direction) => {
        const { selectedItemIdState, selectableItemIdsState } =
          getSelectableListScopedStates({
            selectableListScopeId: scopeId,
          });
        const selectedItemId = getSnapshotValue(snapshot, selectedItemIdState);
        const selectableItemIds = getSnapshotValue(
          snapshot,
          selectableItemIdsState,
        );

        const { row: currentRow, col: currentCol } = findPosition(
          selectableItemIds,
          selectedItemId,
        );

        const computeNextId = (direction: Direction) => {
          if (selectableItemIds.length === 0) {
            return;
          }

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

        if (nextId) {
          const { isSelectedItemIdSelector } = getSelectableListScopedStates({
            selectableListScopeId: scopeId,
            itemId: nextId,
          });
          set(isSelectedItemIdSelector, true);
          set(selectedItemIdState, nextId);
        }

        if (selectedItemId) {
          const { isSelectedItemIdSelector } = getSelectableListScopedStates({
            selectableListScopeId: scopeId,
            itemId: selectedItemId,
          });
          set(isSelectedItemIdSelector, false);
        }
      },
    [scopeId],
  );

  useScopedHotkeys(Key.ArrowUp, () => handleSelect('up'), hotkeyScope, []);

  useScopedHotkeys(Key.ArrowDown, () => handleSelect('down'), hotkeyScope, []);

  useScopedHotkeys(Key.ArrowLeft, () => handleSelect('left'), hotkeyScope, []);

  useScopedHotkeys(
    Key.ArrowRight,
    () => handleSelect('right'),
    hotkeyScope,
    [],
  );

  useScopedHotkeys(
    Key.Enter,
    useRecoilCallback(
      ({ snapshot }) =>
        () => {
          const { selectedItemIdState, selectableListOnEnterState } =
            getSelectableListScopedStates({
              selectableListScopeId: scopeId,
            });
          const selectedItemId = getSnapshotValue(
            snapshot,
            selectedItemIdState,
          );

          const onEnter = getSnapshotValue(
            snapshot,
            selectableListOnEnterState,
          );

          if (selectedItemId) {
            onEnter?.(selectedItemId);
          }
        },
      [scopeId],
    ),
    hotkeyScope,
    [],
  );

  return <></>;
};
