import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { selectableListOnEnterComponentState } from '@/ui/layout/selectable-list/states/selectableListOnEnterComponentState';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

type Direction = 'up' | 'down' | 'left' | 'right';

export const useSelectableListHotKeys = (
  instanceId: string,
  hotkeyScope: string,
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

  const handleSelect = useRecoilCallback(
    ({ snapshot, set }) =>
      (direction: Direction) => {
        const selectedItemId = getSnapshotValue(
          snapshot,
          selectedItemIdComponentState.atomFamily({
            instanceId: instanceId,
          }),
        );
        const selectableItemIds = getSnapshotValue(
          snapshot,
          selectableItemIdsComponentState.atomFamily({
            instanceId: instanceId,
          }),
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
          if (isNonEmptyString(nextId)) {
            set(
              isSelectedItemIdComponentFamilySelector.selectorFamily({
                instanceId: instanceId,
                familyKey: nextId,
              }),
              true,
            );
            set(
              selectedItemIdComponentState.atomFamily({
                instanceId: instanceId,
              }),
              nextId,
            );
            onSelect?.(nextId);
          }

          if (isNonEmptyString(selectedItemId)) {
            set(
              isSelectedItemIdComponentFamilySelector.selectorFamily({
                instanceId: instanceId,
                familyKey: selectedItemId,
              }),
              false,
            );
          }
        }
      },
    [instanceId, onSelect],
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
          const selectedItemId = getSnapshotValue(
            snapshot,
            selectedItemIdComponentState.atomFamily({
              instanceId: instanceId,
            }),
          );
          const onEnter = getSnapshotValue(
            snapshot,
            selectableListOnEnterComponentState.atomFamily({
              instanceId: instanceId,
            }),
          );

          if (isNonEmptyString(selectedItemId)) {
            onEnter?.(selectedItemId);
          }
        },
      [instanceId],
    ),
    hotkeyScope,
    [],
    {
      preventDefault: false,
    },
  );
};
