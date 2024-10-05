import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { isObjectFilterDropdownOperandSelectUnfoldedComponentState } from '@/object-record/object-filter-dropdown/states/isObjectFilterDropdownOperandSelectUnfoldedComponentState';
import { isObjectFilterDropdownUnfoldedComponentState } from '@/object-record/object-filter-dropdown/states/isObjectFilterDropdownUnfoldedComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSelectedOptionValuesComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedOptionValuesComponentState';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { onFilterSelectComponentState } from '@/object-record/object-filter-dropdown/states/onFilterSelectComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useFilterDropdownStates = (scopeId: string) => {
  const filterDefinitionUsedInDropdownState = extractComponentState(
    filterDefinitionUsedInDropdownComponentState,
    scopeId,
  );

  const objectFilterDropdownSearchInputState = extractComponentState(
    objectFilterDropdownSearchInputComponentState,
    scopeId,
  );

  const objectFilterDropdownSelectedRecordIdsState = extractComponentState(
    objectFilterDropdownSelectedRecordIdsComponentState,
    scopeId,
  );

  const objectFilterDropdownSelectedOptionValuesState = extractComponentState(
    objectFilterDropdownSelectedOptionValuesComponentState,
    scopeId,
  );

  const isObjectFilterDropdownOperandSelectUnfoldedState =
    extractComponentState(
      isObjectFilterDropdownOperandSelectUnfoldedComponentState,
      scopeId,
    );

  const isObjectFilterDropdownUnfoldedState = extractComponentState(
    isObjectFilterDropdownUnfoldedComponentState,
    scopeId,
  );

  const selectedFilterState = extractComponentState(
    selectedFilterComponentState,
    scopeId,
  );

  const selectedOperandInDropdownState = extractComponentState(
    selectedOperandInDropdownComponentState,
    scopeId,
  );

  const onFilterSelectState = extractComponentState(
    onFilterSelectComponentState,
    scopeId,
  );

  return {
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    objectFilterDropdownSelectedRecordIdsState,
    objectFilterDropdownSelectedOptionValuesState,
    isObjectFilterDropdownOperandSelectUnfoldedState,
    isObjectFilterDropdownUnfoldedState,
    selectedFilterState,
    selectedOperandInDropdownState,
    onFilterSelectState,
  };
};
