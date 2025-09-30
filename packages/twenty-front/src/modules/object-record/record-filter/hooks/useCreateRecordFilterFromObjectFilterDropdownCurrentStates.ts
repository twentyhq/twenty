import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useCreateRecordFilterFromObjectFilterDropdownCurrentStates =
  () => {
    const fieldMetadataItemUsedInDropdownCallbackState =
      useRecoilComponentCallbackState(
        fieldMetadataItemUsedInDropdownComponentSelector,
      );

    const selectedOperandInDropdownCallbackState =
      useRecoilComponentCallbackState(selectedOperandInDropdownComponentState);

    const subFieldNameUsedInDropdownCallbackState =
      useRecoilComponentCallbackState(subFieldNameUsedInDropdownComponentState);

    const createRecordFilterFromObjectFilterDropdownCurrentStates =
      useRecoilCallback(
        ({ snapshot }) =>
          () => {
            const fieldMetadataItemUsedInDropdown = snapshot
              .getLoadable(fieldMetadataItemUsedInDropdownCallbackState)
              .getValue();

            const selectedOperandInDropdown = snapshot
              .getLoadable(selectedOperandInDropdownCallbackState)
              .getValue();

            const subFieldNameUsedInDropdown = snapshot
              .getLoadable(subFieldNameUsedInDropdownCallbackState)
              .getValue();

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

            const newRecordFilterFromObjectFilterDropdownStates: RecordFilter =
              {
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
          },
        [
          fieldMetadataItemUsedInDropdownCallbackState,
          selectedOperandInDropdownCallbackState,
          subFieldNameUsedInDropdownCallbackState,
        ],
      );

    return {
      createRecordFilterFromObjectFilterDropdownCurrentStates,
    };
  };
