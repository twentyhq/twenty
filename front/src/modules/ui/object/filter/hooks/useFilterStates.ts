import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { availableFilterDefinitionsScopedState } from '../states/availableFilterDefinitionsScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '../states/filterDropdownSearchInputScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '../states/filterDropdownSelectedEntityIdScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { isFilterDropdownUnfoldedScopedState } from '../states/isFilterDropdownUnfoldedScopedState';
import { selectedFilterScopedState } from '../states/selectedFilterScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';

export const useFilterStates = (scopeId: string) => {
  const [availableFilterDefinitions, setAvailableFilterDefinitions] =
    useRecoilScopedStateV2(availableFilterDefinitionsScopedState, scopeId);

  const [filterDefinitionUsedInDropdown, setFilterDefinitionUsedInDropdown] =
    useRecoilScopedStateV2(filterDefinitionUsedInDropdownScopedState, scopeId);

  const [filterDropdownSearchInput, setFilterDropdownSearchInput] =
    useRecoilScopedStateV2(filterDropdownSearchInputScopedState, scopeId);

  const [filterDropdownSelectedEntityId, setFilterDropdownSelectedEntityId] =
    useRecoilScopedStateV2(filterDropdownSelectedEntityIdScopedState, scopeId);

  const [
    isFilterDropdownOperandSelectUnfolded,
    setIsFilterDropdownOperandSelectUnfolded,
  ] = useRecoilScopedStateV2(
    isFilterDropdownOperandSelectUnfoldedScopedState,
    scopeId,
  );

  const [isFilterDropdownUnfolded, setIsFilterDropdownUnfolded] =
    useRecoilScopedStateV2(isFilterDropdownUnfoldedScopedState, scopeId);

  const [selectedFilter, setSelectedFilter] = useRecoilScopedStateV2(
    selectedFilterScopedState,
    scopeId,
  );

  const [selectedOperandInDropdown, setSelectedOperandInDropdown] =
    useRecoilScopedStateV2(selectedOperandInDropdownScopedState, scopeId);

  return {
    availableFilterDefinitions,
    setAvailableFilterDefinitions,
    filterDefinitionUsedInDropdown,
    setFilterDefinitionUsedInDropdown,
    filterDropdownSearchInput,
    setFilterDropdownSearchInput,
    filterDropdownSelectedEntityId,
    setFilterDropdownSelectedEntityId,
    isFilterDropdownOperandSelectUnfolded,
    setIsFilterDropdownOperandSelectUnfolded,
    isFilterDropdownUnfolded,
    setIsFilterDropdownUnfolded,
    selectedFilter,
    setSelectedFilter,
    selectedOperandInDropdown,
    setSelectedOperandInDropdown,
  };
};
