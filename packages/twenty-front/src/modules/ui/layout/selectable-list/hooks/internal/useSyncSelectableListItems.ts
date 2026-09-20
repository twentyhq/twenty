import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { arrayToChunks } from '~/utils/array/arrayToChunks';

type UseSyncSelectableListItemsParams = {
  selectableListInstanceId: string;
  selectableItemIdArray?: string[];
  selectableItemIdMatrix?: string[][];
  shouldPreselectFirstItem: boolean;
};

export const useSyncSelectableListItems = ({
  selectableListInstanceId,
  selectableItemIdArray,
  selectableItemIdMatrix,
  shouldPreselectFirstItem,
}: UseSyncSelectableListItemsParams) => {
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

    if (shouldPreselectFirstItem !== true) {
      return;
    }

    const itemIds =
      selectableItemIdArray ?? selectableItemIdMatrix?.flat() ?? [];
    const firstItemId = itemIds[0];

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
    shouldPreselectFirstItem,
    resetSelectedItem,
    setSelectedItemId,
    store,
  ]);

  useEffect(
    () => () => {
      if (shouldPreselectFirstItem) {
        resetSelectedItem();
      }
    },
    [resetSelectedItem, shouldPreselectFirstItem],
  );
};
