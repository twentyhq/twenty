import { useCallback } from 'react';

import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useCreateRecordFilterFromObjectFilterDropdownCurrentStates } from '@/object-record/record-filter/hooks/useCreateRecordFilterFromObjectFilterDropdownCurrentStates';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { isDefined } from 'twenty-shared/utils';

export const useApplyObjectFilterDropdownFilterValue = () => {
  const objectFilterDropdownCurrentRecordFilterAtom =
    useRecoilComponentStateCallbackStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
    );

  const fieldMetadataItemUsedInDropdownAtom =
    useRecoilComponentSelectorCallbackStateV2(
      fieldMetadataItemUsedInDropdownComponentSelector,
    );

  const { createRecordFilterFromObjectFilterDropdownCurrentStates } =
    useCreateRecordFilterFromObjectFilterDropdownCurrentStates();

  const { upsertObjectFilterDropdownCurrentFilter } =
    useUpsertObjectFilterDropdownCurrentFilter();

  const applyObjectFilterDropdownFilterValue = useCallback(
    (newFilterValue: string, newDisplayValue?: string) => {
      const objectFilterDropdownCurrentRecordFilter = jotaiStore.get(
        objectFilterDropdownCurrentRecordFilterAtom,
      ) as RecordFilter | undefined | null;

      const fieldMetadataItemUsedInDropdown = jotaiStore.get(
        fieldMetadataItemUsedInDropdownAtom,
      );

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
      objectFilterDropdownCurrentRecordFilterAtom,
      fieldMetadataItemUsedInDropdownAtom,
      createRecordFilterFromObjectFilterDropdownCurrentStates,
      upsertObjectFilterDropdownCurrentFilter,
    ],
  );

  return {
    applyObjectFilterDropdownFilterValue,
  };
};
