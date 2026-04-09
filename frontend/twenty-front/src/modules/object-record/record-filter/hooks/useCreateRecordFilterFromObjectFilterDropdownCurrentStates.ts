import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useCreateRecordFilterFromObjectFilterDropdownCurrentStates =
  () => {
    const fieldMetadataItemUsedInDropdownCallbackState =
      useAtomComponentSelectorCallbackState(
        fieldMetadataItemUsedInDropdownComponentSelector,
      );

    const selectedOperandInDropdownCallbackState =
      useAtomComponentStateCallbackState(
        selectedOperandInDropdownComponentState,
      );

    const subFieldNameUsedInDropdownCallbackState =
      useAtomComponentStateCallbackState(
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
