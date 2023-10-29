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
  } = useFilterStates(scopeId);

  return {
    scopeId,
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
