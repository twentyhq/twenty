import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useCreateRecordFilterFromObjectFilterDropdownCurrentStates } from '@/object-record/record-filter/hooks/useCreateRecordFilterFromObjectFilterDropdownCurrentStates';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useApplyObjectFilterDropdownFilterValue = () => {
  const objectFilterDropdownCurrentRecordFilterCallbackState =
    useRecoilComponentCallbackState(
      objectFilterDropdownCurrentRecordFilterComponentState,
    );

  const fieldMetadataItemUsedInDropdownCallbackState =
    useRecoilComponentCallbackState(
      fieldMetadataItemUsedInDropdownComponentSelector,
    );

  const { createRecordFilterFromObjectFilterDropdownCurrentStates } =
    useCreateRecordFilterFromObjectFilterDropdownCurrentStates();

  const { upsertObjectFilterDropdownCurrentFilter } =
    useUpsertObjectFilterDropdownCurrentFilter();

  const applyObjectFilterDropdownFilterValue = useRecoilCallback(
    ({ snapshot }) =>
      (newFilterValue: string, newDisplayValue?: string) => {
        const objectFilterDropdownCurrentRecordFilter = snapshot
          .getLoadable(objectFilterDropdownCurrentRecordFilterCallbackState)
          .getValue();

        const fieldMetadataItemUsedInDropdown = snapshot
          .getLoadable(fieldMetadataItemUsedInDropdownCallbackState)
          .getValue();

        const objectFilterDropdownFilterNotYetCreated = !isDefined(
          objectFilterDropdownCurrentRecordFilter,
        );

        if (objectFilterDropdownFilterNotYetCreated) {
          if (!isDefined(fieldMetadataItemUsedInDropdown)) {
            throw new Error(
              `Field metadata item is not defined in object filter dropdown when setting a filter value to create it, this should not happen.`,
            );
          }

          const { newRecordFilterFromObjectFilterDropdownStates } =
            createRecordFilterFromObjectFilterDropdownCurrentStates();

          const newCurrentRecordFilter = {
            ...newRecordFilterFromObjectFilterDropdownStates,
            value: newFilterValue,
            displayValue: newDisplayValue ?? newFilterValue,
          } satisfies RecordFilter;

          upsertObjectFilterDropdownCurrentFilter(newCurrentRecordFilter);
        } else {
          const newCurrentRecordFilter = {
            ...objectFilterDropdownCurrentRecordFilter,
            value: newFilterValue,
            displayValue: newDisplayValue ?? newFilterValue,
          } satisfies RecordFilter;

          upsertObjectFilterDropdownCurrentFilter(newCurrentRecordFilter);
        }
      },
    [
      objectFilterDropdownCurrentRecordFilterCallbackState,
      fieldMetadataItemUsedInDropdownCallbackState,
      createRecordFilterFromObjectFilterDropdownCurrentStates,
      upsertObjectFilterDropdownCurrentFilter,
    ],
  );

  return {
    applyObjectFilterDropdownFilterValue,
  };
};
