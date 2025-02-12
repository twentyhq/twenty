import { isSortSelectedComponentState } from '@/object-record/object-sort-dropdown/states/isSortSelectedScopedState';
import { objectSortDropdownSearchInputComponentState } from '@/object-record/object-sort-dropdown/states/objectSortDropdownSearchInputComponentState';
import { onSortSelectComponentState } from '@/object-record/object-sort-dropdown/states/onSortSelectScopedState';

export const useSortDropdownStates = (scopeId: string) => {
  const isSortSelectedState = isSortSelectedComponentState.atomFamily({
    instanceId: scopeId,
  });

  const onSortSelectState = onSortSelectComponentState.atomFamily({
    instanceId: scopeId,
  });

  const objectSortDropdownSearchInputState =
    objectSortDropdownSearchInputComponentState.atomFamily({
      instanceId: scopeId,
    });

  return {
    isSortSelectedState,
    onSortSelectState,
    objectSortDropdownSearchInputState,
  };
};
