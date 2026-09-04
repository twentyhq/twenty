import { useCallback } from 'react';
import { useStore } from 'jotai';

import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isDefined } from 'twenty-shared/utils';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useSelectableList = (instanceId?: string) => {
  const surfaceId = useComponentStateSurfaceId();
  const unscopedSelectableListInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      SelectableListComponentInstanceContext,
      instanceId,
    );
  const store = useStore();

  const resetSelectedItem = useCallback(() => {
    const selectedItemId = store.get(
      selectedItemIdComponentState.atomFamily({
        instanceId: unscopedSelectableListInstanceId,
        surfaceId,
      }),
    );

    if (isDefined(selectedItemId)) {
      store.set(
        selectedItemIdComponentState.atomFamily({
          instanceId: unscopedSelectableListInstanceId,
          surfaceId,
        }),
        null,
      );
      store.set(
        isSelectedItemIdComponentFamilyState.atomFamily({
          instanceId: unscopedSelectableListInstanceId,
          surfaceId,
          familyKey: selectedItemId,
        }),
        false,
      );
    }
  }, [store, unscopedSelectableListInstanceId, surfaceId]);

  const setSelectedItemId = useCallback(
    (itemId: string) => {
      const selectedItemId = store.get(
        selectedItemIdComponentState.atomFamily({
          instanceId: unscopedSelectableListInstanceId,
          surfaceId,
        }),
      );

      if (isDefined(selectedItemId)) {
        store.set(
          isSelectedItemIdComponentFamilyState.atomFamily({
            instanceId: unscopedSelectableListInstanceId,
            surfaceId,
            familyKey: selectedItemId,
          }),
          false,
        );
      }

      store.set(
        selectedItemIdComponentState.atomFamily({
          instanceId: unscopedSelectableListInstanceId,
          surfaceId,
        }),
        itemId,
      );
      store.set(
        isSelectedItemIdComponentFamilyState.atomFamily({
          instanceId: unscopedSelectableListInstanceId,
          surfaceId,
          familyKey: itemId,
        }),
        true,
      );
    },
    [store, unscopedSelectableListInstanceId, surfaceId],
  );

  return {
    resetSelectedItem,
    setSelectedItemId,
  };
};
