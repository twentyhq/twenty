import { useCallback } from 'react';
import { useStore } from 'jotai';

import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isDefined } from 'twenty-shared/utils';

export const useSelectableList = (instanceId?: string) => {
  const selectableListInstanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
    instanceId,
  );

  const store = useStore();

  const resetSelectedItem = useCallback(() => {
    const selectedItemId = store.get(
      selectedItemIdComponentState.atomFamily({
        instanceId: selectableListInstanceId,
      }),
    );

    if (isDefined(selectedItemId)) {
      store.set(
        selectedItemIdComponentState.atomFamily({
          instanceId: selectableListInstanceId,
        }),
        null,
      );
      store.set(
        isSelectedItemIdComponentFamilyState.atomFamily({
          instanceId: selectableListInstanceId,
          familyKey: selectedItemId,
        }),
        false,
      );
    }
  }, [store, selectableListInstanceId]);

  const setSelectedItemId = useCallback(
    (itemId: string) => {
      const selectedItemId = store.get(
        selectedItemIdComponentState.atomFamily({
          instanceId: selectableListInstanceId,
        }),
      );

      if (isDefined(selectedItemId)) {
        store.set(
          isSelectedItemIdComponentFamilyState.atomFamily({
            instanceId: selectableListInstanceId,
            familyKey: selectedItemId,
          }),
          false,
        );
      }

      store.set(
        selectedItemIdComponentState.atomFamily({
          instanceId: selectableListInstanceId,
        }),
        itemId,
      );
      store.set(
        isSelectedItemIdComponentFamilyState.atomFamily({
          instanceId: selectableListInstanceId,
          familyKey: itemId,
        }),
        true,
      );
    },
    [store, selectableListInstanceId],
  );

  return {
    resetSelectedItem,
    setSelectedItemId,
  };
};
