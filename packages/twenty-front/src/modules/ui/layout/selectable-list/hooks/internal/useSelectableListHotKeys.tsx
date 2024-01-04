import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

import { useSelectableListScopedState } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListScopedState';
import { getSelectableListScopeInjectors } from '@/ui/layout/selectable-list/utils/internal/getSelectableListScopeInjectors';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

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
      return;
    }

    for (let row = 0; row < selectableItemIds.length; row++) {
      const col = selectableItemIds[row].indexOf(selectedItemId);
      if (col !== -1) {
        return { row, col };
      }
    }
  };

  const { injectSnapshotValueWithSelectableListScopeId } =
    useSelectableListScopedState({
      selectableListScopeId: scopeId,
    });

  const handleSelect = useRecoilCallback(
    ({ snapshot, set }) =>
      (direction: Direction) => {
        const {
          selectedItemIdScopeInjector,
          selectableItemIdsScopeInjector,
          isSelectedItemIdFamilyScopeInjector,
        } = getSelectableListScopeInjectors();

        const selectedItemId = injectSnapshotValueWithSelectableListScopeId(
          snapshot,
          selectedItemIdScopeInjector,
        );
        const selectableItemIds = injectSnapshotValueWithSelectableListScopeId(
          snapshot,
          selectableItemIdsScopeInjector,
        );

        const currentPosition = findPosition(selectableItemIds, selectedItemId);

        const computeNextId = (direction: Direction) => {
          if (!selectedItemId || !currentPosition) {
            return selectableItemIds[0][0];
          }

          const { row: currentRow, col: currentCol } = currentPosition;

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

        if (selectedItemId !== nextId) {
          if (nextId) {
            set(isSelectedItemIdFamilyScopeInjector(scopeId, nextId), true);
            set(selectedItemIdScopeInjector(scopeId), nextId);
          }

          if (selectedItemId) {
            set(
              isSelectedItemIdFamilyScopeInjector(scopeId, selectedItemId),
              false,
            );
          }
        }
      },
    [injectSnapshotValueWithSelectableListScopeId, scopeId],
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
          const {
            selectedItemIdScopeInjector,
            selectableListOnEnterScopeInjector,
          } = getSelectableListScopeInjectors();
          const selectedItemId = injectSnapshotValueWithSelectableListScopeId(
            snapshot,
            selectedItemIdScopeInjector,
          );

          const onEnter = injectSnapshotValueWithSelectableListScopeId(
            snapshot,
            selectableListOnEnterScopeInjector,
          );

          if (selectedItemId) {
            onEnter?.(selectedItemId);
          }
        },
      [injectSnapshotValueWithSelectableListScopeId],
    ),
    hotkeyScope,
    [],
  );

  return <></>;
};
