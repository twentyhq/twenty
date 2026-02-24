import { useCallback } from 'react';

import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useCreateRecordFilterFromObjectFilterDropdownCurrentStates } from '@/object-record/record-filter/hooks/useCreateRecordFilterFromObjectFilterDropdownCurrentStates';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useApplyObjectFilterDropdownFilterValue = () => {
  const store = useStore();
  const objectFilterDropdownCurrentRecordFilter =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
    );

  const fieldMetadataItemUsedInDropdown =
    useRecoilComponentSelectorCallbackStateV2(
      fieldMetadataItemUsedInDropdownComponentSelector,
    );

  const { createRecordFilterFromObjectFilterDropdownCurrentStates } =
    useCreateRecordFilterFromObjectFilterDropdownCurrentStates();

  const { upsertObjectFilterDropdownCurrentFilter } =
    useUpsertObjectFilterDropdownCurrentFilter();

  const applyObjectFilterDropdownFilterValue = useCallback(
    (newFilterValue: string, newDisplayValue?: string) => {
      const existingObjectFilterDropdownCurrentRecordFilter = store.get(
        objectFilterDropdownCurrentRecordFilter,
      ) as RecordFilter | undefined | null;

      const currentFieldMetadataItemUsedInDropdown = store.get(
        fieldMetadataItemUsedInDropdown,
      );

      const objectFilterDropdownFilterNotYetCreated = !isDefined(
        existingObjectFilterDropdownCurrentRecordFilter,
      );

      if (objectFilterDropdownFilterNotYetCreated) {
        if (!isDefined(currentFieldMetadataItemUsedInDropdown)) {
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
          ...existingObjectFilterDropdownCurrentRecordFilter,
          value: newFilterValue,
          displayValue: newDisplayValue ?? newFilterValue,
        } satisfies RecordFilter;

        upsertObjectFilterDropdownCurrentFilter(newCurrentRecordFilter);
      }
    },
    [
      objectFilterDropdownCurrentRecordFilter,
      fieldMetadataItemUsedInDropdown,
      createRecordFilterFromObjectFilterDropdownCurrentStates,
      upsertObjectFilterDropdownCurrentFilter,
      store,
    ],
  );

  return {
    applyObjectFilterDropdownFilterValue,
  };
};
