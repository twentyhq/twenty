import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { unresolvedRecordFiltersComponentState } from '@/object-record/record-filter/states/unresolvedRecordFiltersComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';

export const useRemoveUnresolvedRecordFilter = () => {
  const setUnresolvedRecordFilters = useSetAtomComponentState(
    unresolvedRecordFiltersComponentState,
  );

  const { onUpdate } = useContext(AdvancedFilterContext);

  const removeUnresolvedRecordFilter = ({
    recordFilterId,
  }: {
    recordFilterId: string;
  }) => {
    setUnresolvedRecordFilters((unresolvedRecordFilters) =>
      unresolvedRecordFilters.filter(
        (unresolvedRecordFilter) =>
          unresolvedRecordFilter.id !== recordFilterId,
      ),
    );

    onUpdate?.();
  };

  return { removeUnresolvedRecordFilter };
};
