import { isSortSelectedComponentState } from '@/object-record/object-sort-dropdown/states/isSortSelectedScopedState';
import { onSortSelectComponentState } from '@/object-record/object-sort-dropdown/states/onSortSelectScopedState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { availableSortDefinitionsComponentState } from '@/views/states/availableSortDefinitionsComponentState';

export const useSortDropdownStates = (scopeId: string) => {
  const availableSortDefinitionsState = extractComponentState(
    availableSortDefinitionsComponentState,
    scopeId,
  );

  const isSortSelectedState = extractComponentState(
    isSortSelectedComponentState,
    scopeId,
  );

  const onSortSelectState = extractComponentState(
    onSortSelectComponentState,
    scopeId,
  );

  return {
    availableSortDefinitionsState,
    isSortSelectedState,
    onSortSelectState,
  };
};
