import { isNull } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

import { useSelectableListScopedStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListScopedStates';
import { getSelectableListScopedStates } from '@/ui/layout/selectable-list/utils/getSelectableListScopedStates';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const SelectableListInternalEffect = () => {
  const { scopeId } = useSelectableListScopedStates();

  const handleSelect = useRecoilCallback(
    ({ snapshot, set }) =>
      (direction: 'up' | 'down') => {
        const { selectedItemIdState, selectableItemIdsState } =
          getSelectableListScopedStates({
            selectableListScopeId: scopeId,
          });
        const selectedItemId = getSnapshotValue(snapshot, selectedItemIdState);
        const selectableItemIds = getSnapshotValue(
          snapshot,
          selectableItemIdsState,
        );

        const computeNextId = (direction: 'up' | 'down') => {
          if (selectableItemIds.length === 0) {
            return;
          }

          if (isNull(selectedItemId)) {
            return direction === 'up'
              ? selectableItemIds[selectableItemIds.length - 1]
              : selectableItemIds[0];
          }

          const currentIndex = selectableItemIds.indexOf(selectedItemId);
          if (currentIndex === -1) {
            return direction === 'up'
              ? selectableItemIds[selectableItemIds.length - 1]
              : selectableItemIds[0];
          }

          return direction === 'up'
            ? currentIndex == 0
              ? selectableItemIds[selectableItemIds.length - 1]
              : selectableItemIds[currentIndex - 1]
            : currentIndex == selectableItemIds.length - 1
            ? selectableItemIds[0]
            : selectableItemIds[currentIndex + 1];
        };

        const nextId = computeNextId(direction);

        if (nextId) {
          const { selectableItemIdsSelectedMapState } =
            getSelectableListScopedStates({
              selectableListScopeId: scopeId,
              itemId: nextId,
            });
          set(selectableItemIdsSelectedMapState, true);
          set(selectedItemIdState, nextId);
        }

        if (selectedItemId) {
          const { selectableItemIdsSelectedMapState } =
            getSelectableListScopedStates({
              selectableListScopeId: scopeId,
              itemId: selectedItemId,
            });
          set(selectableItemIdsSelectedMapState, false);
        }
      },
    [scopeId],
  );

  useScopedHotkeys(
    Key.ArrowUp,
    () => handleSelect('up'),
    AppHotkeyScope.CommandMenu,
    [],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => handleSelect('down'),
    AppHotkeyScope.CommandMenu,
    [],
  );

  return <></>;
};
