import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveRecordFilter = () => {
  const currentRecordFiltersAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFiltersComponentState,
  );

  const store = useStore();
  const { onUpdate } = useContext(AdvancedFilterContext);

  const removeRecordFilterCallback = useCallback(
    ({ recordFilterId }: { recordFilterId: string }) => {
      const currentRecordFilters = store.get(
        currentRecordFiltersAtom,
      ) as RecordFilter[];

      const filterToRemove = currentRecordFilters.find(
        (existingFilter) => existingFilter.id === recordFilterId,
      );

      if (!isDefined(filterToRemove)) {
        return;
      }

      store.set(
        currentRecordFiltersAtom,
        (currentRecordFilters: RecordFilter[]) => {
          const newCurrentRecordFilters = [...currentRecordFilters];

          const indexOfFilterToRemove = newCurrentRecordFilters.findIndex(
            (existingFilter) => existingFilter.id === recordFilterId,
          );

          newCurrentRecordFilters.splice(indexOfFilterToRemove, 1);

          return newCurrentRecordFilters;
        },
      );
    },
    [currentRecordFiltersAtom, store],
  );

  const removeRecordFilter = ({
    recordFilterId,
  }: {
    recordFilterId: string;
  }) => {
    removeRecordFilterCallback({ recordFilterId });
    onUpdate?.();
  };

  return {
    removeRecordFilter,
  };
};
