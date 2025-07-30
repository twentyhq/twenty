import { useRecoilCallback } from 'recoil';

import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';

export const useSelectableList = (instanceId?: string) => {
  const selectableListInstanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
    instanceId,
  );
  const resetSelectedItem = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const selectedItemId = getSnapshotValue(
          snapshot,
          selectedItemIdComponentState.atomFamily({
            instanceId: selectableListInstanceId,
          }),
        );

        if (isDefined(selectedItemId)) {
          set(
            selectedItemIdComponentState.atomFamily({
              instanceId: selectableListInstanceId,
            }),
            null,
          );
          set(
            isSelectedItemIdComponentFamilySelector.selectorFamily({
              instanceId: selectableListInstanceId,
              familyKey: selectedItemId,
            }),
            false,
          );
        }
      },
    [selectableListInstanceId],
  );

  const setSelectedItemId = useRecoilCallback(
    ({ set, snapshot }) =>
      (itemId: string) => {
        const selectedItemId = getSnapshotValue(
          snapshot,
          selectedItemIdComponentState.atomFamily({
            instanceId: selectableListInstanceId,
          }),
        );

        if (isDefined(selectedItemId)) {
          set(
            isSelectedItemIdComponentFamilySelector.selectorFamily({
              instanceId: selectableListInstanceId,
              familyKey: selectedItemId,
            }),
            false,
          );
        }

        set(
          selectedItemIdComponentState.atomFamily({
            instanceId: selectableListInstanceId,
          }),
          itemId,
        );
        set(
          isSelectedItemIdComponentFamilySelector.selectorFamily({
            instanceId: selectableListInstanceId,
            familyKey: itemId,
          }),
          true,
        );
      },
    [selectableListInstanceId],
  );

  return {
    resetSelectedItem,
    setSelectedItemId,
  };
};
