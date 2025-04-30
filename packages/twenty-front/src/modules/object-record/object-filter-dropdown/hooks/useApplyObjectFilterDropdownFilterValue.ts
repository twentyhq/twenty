import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useCreateRecordFilterFromObjectFilterDropdownCurrentStates } from '@/object-record/record-filter/hooks/useCreateRecordFilterFromObjectFilterDropdownCurrentStates';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useApplyObjectFilterDropdownFilterValue = () => {
  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValueV2(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const objectFilterDropdownFilterNotYetCreated = !isDefined(
    objectFilterDropdownCurrentRecordFilter,
  );

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const { createRecordFilterFromObjectFilterDropdownCurrentStates } =
    useCreateRecordFilterFromObjectFilterDropdownCurrentStates();

  const { upsertObjectFilterDropdownCurrentFilter } =
    useUpsertObjectFilterDropdownCurrentFilter();

  const applyObjectFilterDropdownFilterValue = (newFilterValue: string) => {
    if (objectFilterDropdownFilterNotYetCreated) {
      if (!isDefined(fieldMetadataItemUsedInDropdown)) {
        throw new Error(
          `Field metadata item is not defined in object filter dropdown when setting a filter value to create it, this should not happen.`,
        );
      }

      const { newRecordFilterFromObjectFilterDropdownStates } =
        createRecordFilterFromObjectFilterDropdownCurrentStates(
          fieldMetadataItemUsedInDropdown,
        );

      const newCurrentRecordFilter = {
        ...newRecordFilterFromObjectFilterDropdownStates,
        value: newFilterValue,
        displayValue: newFilterValue,
      } satisfies RecordFilter;

      upsertObjectFilterDropdownCurrentFilter(newCurrentRecordFilter);
    } else {
      const newCurrentRecordFilter = {
        ...objectFilterDropdownCurrentRecordFilter,
        value: newFilterValue,
        displayValue: newFilterValue,
      } satisfies RecordFilter;

      upsertObjectFilterDropdownCurrentFilter(newCurrentRecordFilter);
    }
  };

  return {
    applyObjectFilterDropdownFilterValue,
  };
};
