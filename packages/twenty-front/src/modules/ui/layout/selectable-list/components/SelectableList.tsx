import { type ReactNode, useEffect } from 'react';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useSelectableListHotKeys } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListHotKeys';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { SelectableListContextProvider } from '@/ui/layout/selectable-list/states/contexts/SelectableListContext';
import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { arrayToChunks } from '~/utils/array/arrayToChunks';

type SelectableListProps = {
  children: ReactNode;
  selectableItemIdArray?: string[];
  selectableItemIdMatrix?: string[][];
  onSelect?: (selected: string) => void;
  selectableListInstanceId: string;
  focusId: string;
  shouldSelectFirstItemOnListChange?: boolean;
};

export const SelectableList = ({
  children,
  selectableItemIdArray,
  selectableItemIdMatrix,
  selectableListInstanceId,
  onSelect,
  focusId,
  shouldSelectFirstItemOnListChange,
}: SelectableListProps) => {
  useSelectableListHotKeys(selectableListInstanceId, focusId, onSelect);

  const store = useStore();

  const { resetSelectedItem, setSelectedItemId } = useSelectableList(
    selectableListInstanceId,
  );

  const setSelectableItemIds = useSetAtomComponentState(
    selectableItemIdsComponentState,
    selectableListInstanceId,
  );

  useEffect(() => {
    if (!selectableItemIdArray && !selectableItemIdMatrix) {
      throw new Error(
        'Either selectableItemIdArray or selectableItemIdsMatrix must be provided',
      );
    }

    if (isDefined(selectableItemIdMatrix)) {
      setSelectableItemIds(selectableItemIdMatrix);
    }

    if (isDefined(selectableItemIdArray)) {
      setSelectableItemIds(arrayToChunks(selectableItemIdArray, 1));
    }

    if (shouldSelectFirstItemOnListChange !== true) {
      return;
    }

    const itemIds = selectableItemIdArray ?? selectableItemIdMatrix?.flat();
    const firstItemId = itemIds?.[0];

    if (!isDefined(firstItemId)) {
      resetSelectedItem();
      return;
    }

    const selectedItemId = store.get(
      selectedItemIdComponentState.atomFamily({
        instanceId: selectableListInstanceId,
      }),
    );

    if (!isDefined(selectedItemId) || !itemIds.includes(selectedItemId)) {
      setSelectedItemId(firstItemId);
    }
  }, [
    selectableItemIdArray,
    selectableItemIdMatrix,
    selectableListInstanceId,
    setSelectableItemIds,
    shouldSelectFirstItemOnListChange,
    resetSelectedItem,
    setSelectedItemId,
    store,
  ]);

  return (
    <SelectableListComponentInstanceContext.Provider
      value={{
        instanceId: selectableListInstanceId,
      }}
    >
      <SelectableListContextProvider value={{ focusId }}>
        {children}
      </SelectableListContextProvider>
    </SelectableListComponentInstanceContext.Provider>
  );
};
