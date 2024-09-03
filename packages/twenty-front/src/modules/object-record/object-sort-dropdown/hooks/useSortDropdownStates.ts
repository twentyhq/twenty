import { isSortSelectedComponentState } from '@/object-record/object-sort-dropdown/states/isSortSelectedScopedState';
import { objectSortDropdownSearchInputComponentState } from '@/object-record/object-sort-dropdown/states/objectSortDropdownSearchInputComponentState';
import { onSortSelectComponentState } from '@/object-record/object-sort-dropdown/states/onSortSelectScopedState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useSortDropdownStates = (scopeId: string) => {
  const isSortSelectedState = extractComponentState(
    isSortSelectedComponentState,
    scopeId,
  );

  const onSortSelectState = extractComponentState(
    onSortSelectComponentState,
    scopeId,
  );

  const objectSortDropdownSearchInputState = extractComponentState(
    objectSortDropdownSearchInputComponentState,
    scopeId,
  );

  return {
    isSortSelectedState,
    onSortSelectState,
    objectSortDropdownSearchInputState,
  };
};
