import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useFilterDropdownStates } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdownStates';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

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
    availableFilterDefinitionsState,
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    objectFilterDropdownSelectedEntityIdState,
    objectFilterDropdownSelectedRecordIdsState,
    objectFilterDropdownSelectedOptionValuesState,
    isObjectFilterDropdownOperandSelectUnfoldedState,
    isObjectFilterDropdownUnfoldedState,
    selectedFilterState,
    selectedOperandInDropdownState,
    onFilterSelectState,
  } = useFilterDropdownStates(scopeId);

  const selectFilter = useRecoilCallback(
    ({ set, snapshot }) =>
      (filter: Filter | null) => {
        set(selectedFilterState, filter);
        const onFilterSelect = getSnapshotValue(snapshot, onFilterSelectState);

        onFilterSelect?.(filter);
      },
    [selectedFilterState, onFilterSelectState],
  );

  const emptyFilterButKeepDefinition = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectFilterDropdownSearchInputState, '');
        set(objectFilterDropdownSelectedEntityIdState, null);
        set(objectFilterDropdownSelectedRecordIdsState, []);
        set(selectedFilterState, undefined);
      },
    [
      objectFilterDropdownSearchInputState,
      objectFilterDropdownSelectedEntityIdState,
      objectFilterDropdownSelectedRecordIdsState,
      selectedFilterState,
    ],
  );

  const resetFilter = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectFilterDropdownSearchInputState, '');
        set(objectFilterDropdownSelectedEntityIdState, null);
        set(objectFilterDropdownSelectedRecordIdsState, []);
        set(selectedFilterState, undefined);
        set(filterDefinitionUsedInDropdownState, null);
        set(selectedOperandInDropdownState, null);
      },
    [
      filterDefinitionUsedInDropdownState,
      objectFilterDropdownSearchInputState,
      objectFilterDropdownSelectedEntityIdState,
      objectFilterDropdownSelectedRecordIdsState,
      selectedFilterState,
      selectedOperandInDropdownState,
    ],
  );

  const setAvailableFilterDefinitions = useSetRecoilState(
    availableFilterDefinitionsState,
  );
  const setSelectedFilter = useSetRecoilState(selectedFilterState);
  const setSelectedOperandInDropdown = useSetRecoilState(
    selectedOperandInDropdownState,
  );
  const setFilterDefinitionUsedInDropdown = useSetRecoilState(
    filterDefinitionUsedInDropdownState,
  );
  const setObjectFilterDropdownSearchInput = useSetRecoilState(
    objectFilterDropdownSearchInputState,
  );
  const setObjectFilterDropdownSelectedEntityId = useSetRecoilState(
    objectFilterDropdownSelectedEntityIdState,
  );
  const setObjectFilterDropdownSelectedRecordIds = useSetRecoilState(
    objectFilterDropdownSelectedRecordIdsState,
  );
  const setObjectFilterDropdownSelectedOptionValues = useSetRecoilState(
    objectFilterDropdownSelectedOptionValuesState,
  );
  const setIsObjectFilterDropdownOperandSelectUnfolded = useSetRecoilState(
    isObjectFilterDropdownOperandSelectUnfoldedState,
  );
  const setIsObjectFilterDropdownUnfolded = useSetRecoilState(
    isObjectFilterDropdownUnfoldedState,
  );
  const setOnFilterSelect = useSetRecoilState(onFilterSelectState);

  return {
    scopeId,
    selectFilter,
    resetFilter,
    setSelectedFilter,
    setSelectedOperandInDropdown,
    setAvailableFilterDefinitions,
    setFilterDefinitionUsedInDropdown,
    setObjectFilterDropdownSearchInput,
    setObjectFilterDropdownSelectedEntityId,
    setObjectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedOptionValues,
    setIsObjectFilterDropdownOperandSelectUnfolded,
    setIsObjectFilterDropdownUnfolded,
    setOnFilterSelect,
    emptyFilterButKeepDefinition,
    availableFilterDefinitionsState,
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    objectFilterDropdownSelectedEntityIdState,
    objectFilterDropdownSelectedRecordIdsState,
    objectFilterDropdownSelectedOptionValuesState,
    isObjectFilterDropdownOperandSelectUnfoldedState,
    isObjectFilterDropdownUnfoldedState,
    selectedFilterState,
    selectedOperandInDropdownState,
    onFilterSelectState,
  };
};
