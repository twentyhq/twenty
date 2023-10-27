import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { FilterScopeInternalContext } from '../scopes/scope-internal-context/FilterScopeInternalContext';

import { useFilterStates } from './useFilterStates';

type UseFilterProps = {
  filterScopeId?: string;
};

export const useFilter = (props?: UseFilterProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    FilterScopeInternalContext,
    props?.filterScopeId,
  );
  const {
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
  } = useFilterStates(scopeId);

  return {
    scopeId,
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
