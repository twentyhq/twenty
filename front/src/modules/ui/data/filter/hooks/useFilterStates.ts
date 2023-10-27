import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '../states/filterDropdownSearchInputScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '../states/filterDropdownSelectedEntityIdScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { isFilterDropdownUnfoldedScopedState } from '../states/isFilterDropdownUnfoldedScopedState';
import { selectedFiltersScopedState } from '../states/selectedFiltersScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';

export const useFilterStates = (scopeId: string) => {
  const [availableFilters, setAvailableFilters] = useRecoilScopedStateV2(
    availableFiltersScopedState,
    scopeId,
  );

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

  const [selectedFilters, setSelectedFilters] = useRecoilScopedStateV2(
    selectedFiltersScopedState,
    scopeId,
  );

  const [selectedOperandInDropdown, setSelectedOperandInDropdown] =
    useRecoilScopedStateV2(selectedOperandInDropdownScopedState, scopeId);

  return {
    availableFilters,
    setAvailableFilters,
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
    selectedFilters,
    setSelectedFilters,
    selectedOperandInDropdown,
    setSelectedOperandInDropdown,
  };
};
