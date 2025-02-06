import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';

export const useUpsertRecordFilter = () => {
  const currentRecordFiltersCallbackState = useRecoilComponentCallbackStateV2(
    currentRecordFiltersComponentState,
  );

  const upsertRecordFilter = useRecoilCallback(
    ({ set, snapshot }) =>
      (filter: RecordFilter) => {
        const currentRecordFilters = getSnapshotValue(
          snapshot,
          currentRecordFiltersCallbackState,
        );

        // TODO: This is a temporary solution to ensure that the record filter is compatible with filter definitions
        // Label and type will be set without definition
        const recordFilterToSet: RecordFilter = {
          ...filter,
          label: filter.definition.label,
          type: filter.definition.type,
        };

        const foundRecordFilterInCurrentRecordFilters =
          currentRecordFilters.some(
            (existingFilter) =>
              existingFilter.fieldMetadataId ===
              recordFilterToSet.fieldMetadataId,
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
              (existingFilter) =>
                existingFilter.fieldMetadataId ===
                recordFilterToSet.fieldMetadataId,
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

  return {
    upsertRecordFilter,
  };
};
