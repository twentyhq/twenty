import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

export const useUpsertRecordFilter = () => {
  const currentRecordFiltersCallbackState = useRecoilComponentCallbackState(
    currentRecordFiltersComponentState,
  );

  const { onUpdate } = useContext(AdvancedFilterContext);

  const upsertRecordFilterCallback = useRecoilCallback(
    ({ set, snapshot }) =>
      (recordFilterToSet: RecordFilter) => {
        const currentRecordFilters = getSnapshotValue(
          snapshot,
          currentRecordFiltersCallbackState,
        );

        const foundRecordFilterInCurrentRecordFilters =
          currentRecordFilters.some(
            (existingFilter) => existingFilter.id === recordFilterToSet.id,
          );

        if (!foundRecordFilterInCurrentRecordFilters) {
          set(currentRecordFiltersCallbackState, [
            ...currentRecordFilters,
            recordFilterToSet,
          ]);
        } else {
          set(currentRecordFiltersCallbackState, (currentRecordFilters) => {
            const newCurrentRecordFilters = [...currentRecordFilters];

            const indexOfFilterToUpdate = newCurrentRecordFilters.findIndex(
              (existingFilter) => existingFilter.id === recordFilterToSet.id,
            );

            newCurrentRecordFilters[indexOfFilterToUpdate] = {
              ...recordFilterToSet,
            };

            return newCurrentRecordFilters;
          });
        }
      },
    [currentRecordFiltersCallbackState],
  );

  const upsertRecordFilter = (recordFilterToSet: RecordFilter) => {
    upsertRecordFilterCallback(recordFilterToSet);
    onUpdate?.();
  };

  return {
    upsertRecordFilter,
  };
};
