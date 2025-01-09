import { advancedFilterViewFilterGroupIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterGroupIdComponentState';
import { advancedFilterViewFilterIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterIdComponentState';
import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSelectedOptionValuesComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedOptionValuesComponentState';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { onFilterSelectComponentState } from '@/object-record/object-filter-dropdown/states/onFilterSelectComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';

export const useFilterDropdownStates = (componentInstanceId: string) => {
  const filterDefinitionUsedInDropdownState =
    filterDefinitionUsedInDropdownComponentState.atomFamily({
      instanceId: componentInstanceId,
    });

  const objectFilterDropdownSearchInputState =
    objectFilterDropdownSearchInputComponentState.atomFamily({
      instanceId: componentInstanceId,
    });

  const objectFilterDropdownSelectedRecordIdsState =
    objectFilterDropdownSelectedRecordIdsComponentState.atomFamily({
      instanceId: componentInstanceId,
    });

  const objectFilterDropdownSelectedOptionValuesState =
    objectFilterDropdownSelectedOptionValuesComponentState.atomFamily({
      instanceId: componentInstanceId,
    });

  const selectedFilterState = selectedFilterComponentState.atomFamily({
    instanceId: componentInstanceId,
  });

  const selectedOperandInDropdownState =
    selectedOperandInDropdownComponentState.atomFamily({
      instanceId: componentInstanceId,
    });

  const onFilterSelectState = onFilterSelectComponentState.atomFamily({
    instanceId: componentInstanceId,
  });

  const advancedFilterViewFilterGroupIdState =
    advancedFilterViewFilterGroupIdComponentState.atomFamily({
      instanceId: componentInstanceId,
    });

  const advancedFilterViewFilterIdState =
    advancedFilterViewFilterIdComponentState.atomFamily({
      instanceId: componentInstanceId,
    });

  return {
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    objectFilterDropdownSelectedRecordIdsState,
    objectFilterDropdownSelectedOptionValuesState,
    selectedFilterState,
    selectedOperandInDropdownState,
    onFilterSelectState,
    advancedFilterViewFilterGroupIdState,
    advancedFilterViewFilterIdState,
  };
};
