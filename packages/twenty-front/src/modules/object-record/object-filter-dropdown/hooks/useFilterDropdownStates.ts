import { objectFilterDropdownSelectedRecordIdsScopedState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsScopedState';
import { onFilterSelectScopedState } from '@/object-record/object-filter-dropdown/states/onFilterSelectScopedState';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { availableFilterDefinitionsScopedState } from '../states/availableFilterDefinitionsScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { isObjectFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isObjectFilterDropdownOperandSelectUnfoldedScopedState';
import { isObjectFilterDropdownUnfoldedScopedState } from '../states/isObjectFilterDropdownUnfoldedScopedState';
import { objectFilterDropdownSearchInputScopedState } from '../states/objectFilterDropdownSearchInputScopedState';
import { objectFilterDropdownSelectedEntityIdScopedState } from '../states/objectFilterDropdownSelectedEntityIdScopedState';
import { selectedFilterScopedState } from '../states/selectedFilterScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';

export const useFilterDropdownStates = (scopeId: string) => {
  const [availableFilterDefinitions, setAvailableFilterDefinitions] =
    useRecoilScopedStateV2(availableFilterDefinitionsScopedState, scopeId);

  const [filterDefinitionUsedInDropdown, setFilterDefinitionUsedInDropdown] =
    useRecoilScopedStateV2(filterDefinitionUsedInDropdownScopedState, scopeId);

  const [objectFilterDropdownSearchInput, setObjectFilterDropdownSearchInput] =
    useRecoilScopedStateV2(objectFilterDropdownSearchInputScopedState, scopeId);

  const [
    objectFilterDropdownSelectedEntityId,
    setObjectFilterDropdownSelectedEntityId,
  ] = useRecoilScopedStateV2(
    objectFilterDropdownSelectedEntityIdScopedState,
    scopeId,
  );

  const [
    objectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedRecordIds,
  ] = useRecoilScopedStateV2(
    objectFilterDropdownSelectedRecordIdsScopedState,
    scopeId,
  );

  const [
    isObjectFilterDropdownOperandSelectUnfolded,
    setIsObjectFilterDropdownOperandSelectUnfolded,
  ] = useRecoilScopedStateV2(
    isObjectFilterDropdownOperandSelectUnfoldedScopedState,
    scopeId,
  );

  const [isObjectFilterDropdownUnfolded, setIsObjectFilterDropdownUnfolded] =
    useRecoilScopedStateV2(isObjectFilterDropdownUnfoldedScopedState, scopeId);

  const [selectedFilter, setSelectedFilter] = useRecoilScopedStateV2(
    selectedFilterScopedState,
    scopeId,
  );

  const [selectedOperandInDropdown, setSelectedOperandInDropdown] =
    useRecoilScopedStateV2(selectedOperandInDropdownScopedState, scopeId);

  const [onFilterSelect, setOnFilterSelect] = useRecoilScopedStateV2(
    onFilterSelectScopedState,
    scopeId,
  );

  return {
    availableFilterDefinitions,
    setAvailableFilterDefinitions,
    filterDefinitionUsedInDropdown,
    setFilterDefinitionUsedInDropdown,
    objectFilterDropdownSearchInput,
    setObjectFilterDropdownSearchInput,
    objectFilterDropdownSelectedEntityId,
    setObjectFilterDropdownSelectedEntityId,
    objectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedRecordIds,
    isObjectFilterDropdownOperandSelectUnfolded,
    setIsObjectFilterDropdownOperandSelectUnfolded,
    isObjectFilterDropdownUnfolded,
    setIsObjectFilterDropdownUnfolded,
    selectedFilter,
    setSelectedFilter,
    selectedOperandInDropdown,
    setSelectedOperandInDropdown,
    onFilterSelect,
    setOnFilterSelect,
  };
};
