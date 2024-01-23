import { useCallback } from 'react';

import { useFilterDropdownStates } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdownStates';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ObjectFilterDropdownScopeInternalContext } from '../scopes/scope-internal-context/ObjectFilterDropdownScopeInternalContext';
import { Filter } from '../types/Filter';

type UseFilterDropdownProps = {
  filterDropdownId?: string;
};

export const useFilterDropdown = (props?: UseFilterDropdownProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ObjectFilterDropdownScopeInternalContext,
    props?.filterDropdownId,
  );

  const {
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
  } = useFilterDropdownStates(scopeId);

  const selectFilter = useCallback(
    (filter: Filter | null) => {
      setSelectedFilter(filter);
      onFilterSelect?.(filter);
    },
    [setSelectedFilter, onFilterSelect],
  );

  const emptyFilterButKeepDefinition = useCallback(() => {
    setObjectFilterDropdownSearchInput('');
    setObjectFilterDropdownSelectedEntityId(null);
    setObjectFilterDropdownSelectedRecordIds([]);
    setSelectedFilter(undefined);
  }, [
    setSelectedFilter,
    setObjectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedEntityId,
    setObjectFilterDropdownSearchInput,
  ]);

  const resetFilter = useCallback(() => {
    setObjectFilterDropdownSearchInput('');
    setObjectFilterDropdownSelectedEntityId(null);
    setObjectFilterDropdownSelectedRecordIds([]);
    setSelectedFilter(undefined);
    setFilterDefinitionUsedInDropdown(null);
    setSelectedOperandInDropdown(null);
  }, [
    setFilterDefinitionUsedInDropdown,
    setObjectFilterDropdownSearchInput,
    setObjectFilterDropdownSelectedEntityId,
    setObjectFilterDropdownSelectedRecordIds,
    setSelectedFilter,
    setSelectedOperandInDropdown,
  ]);

  return {
    scopeId,
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
    selectFilter,
    resetFilter,
    onFilterSelect,
    setOnFilterSelect,
    emptyFilterButKeepDefinition,
  };
};
