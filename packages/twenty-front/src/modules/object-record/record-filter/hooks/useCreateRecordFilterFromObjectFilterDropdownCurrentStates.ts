import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useCreateRecordFilterFromObjectFilterDropdownCurrentStates =
  () => {
    const fieldMetadataItemUsedInDropdownCallbackState =
      useRecoilComponentSelectorCallbackStateV2(
        fieldMetadataItemUsedInDropdownComponentSelector,
      );

    const selectedOperandInDropdownCallbackState =
      useRecoilComponentStateCallbackStateV2(
        selectedOperandInDropdownComponentState,
      );

    const subFieldNameUsedInDropdownCallbackState =
      useRecoilComponentStateCallbackStateV2(
        subFieldNameUsedInDropdownComponentState,
      );

    const store = useStore();

    const createRecordFilterFromObjectFilterDropdownCurrentStates =
      useCallback(() => {
        const fieldMetadataItemUsedInDropdown = store.get(
          fieldMetadataItemUsedInDropdownCallbackState,
        );

        const selectedOperandInDropdown = store.get(
          selectedOperandInDropdownCallbackState,
        );

        const subFieldNameUsedInDropdown = store.get(
          subFieldNameUsedInDropdownCallbackState,
        );

        if (!isDefined(fieldMetadataItemUsedInDropdown)) {
          throw new Error(
            `Field metadata item used in dropdown is not defined when creating a record filter from object filter dropdown current states, this should not happen.`,
          );
        }

        const filterType = getFilterTypeFromFieldType(
          fieldMetadataItemUsedInDropdown.type,
        );

        if (!isDefined(selectedOperandInDropdown)) {
          throw new Error(
            `Selected operand in dropdown is not defined when creating a record filter from object filter dropdown current states, this should not happen.`,
          );
        }

        const newRecordFilterFromObjectFilterDropdownStates: RecordFilter = {
          id: v4(),
          fieldMetadataId: fieldMetadataItemUsedInDropdown.id,
          operand: selectedOperandInDropdown,
          displayValue: '',
          label: fieldMetadataItemUsedInDropdown.label,
          type: filterType,
          value: '',
          subFieldName: subFieldNameUsedInDropdown,
        };

        return { newRecordFilterFromObjectFilterDropdownStates };
      }, [
        fieldMetadataItemUsedInDropdownCallbackState,
        selectedOperandInDropdownCallbackState,
        store,
        subFieldNameUsedInDropdownCallbackState,
      ]);

    return {
      createRecordFilterFromObjectFilterDropdownCurrentStates,
    };
  };
