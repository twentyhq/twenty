import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useFilterDropdownStates } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdownStates';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { isDefined } from 'twenty-ui';
import { ObjectFilterDropdownScopeInternalContext } from '../scopes/scope-internal-context/ObjectFilterDropdownScopeInternalContext';
import { Filter } from '../types/Filter';

type UseFilterDropdownProps = {
  filterDropdownId?: string;
  advancedFilterViewFilterId?: string;
};

export const useFilterDropdown = (props?: UseFilterDropdownProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ObjectFilterDropdownScopeInternalContext,
    props?.filterDropdownId,
  );

  const {
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    objectFilterDropdownSelectedRecordIdsState,
    objectFilterDropdownSelectedOptionValuesState,
    isObjectFilterDropdownOperandSelectUnfoldedState,
    isObjectFilterDropdownUnfoldedState,
    selectedFilterState,
    selectedOperandInDropdownState,
    advancedFilterViewFilterGroupIdState,
    advancedFilterViewFilterIdState,
  } = useFilterDropdownStates(scopeId);

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const selectFilter = useRecoilCallback(
    ({ set }) =>
      (filter: Filter | null) => {
        set(selectedFilterState, filter);

        if (isDefined(filter)) {
          upsertCombinedViewFilter(filter);
        }
      },
    [selectedFilterState, upsertCombinedViewFilter],
  );

  const emptyFilterButKeepDefinition = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectFilterDropdownSearchInputState, '');
        set(objectFilterDropdownSelectedRecordIdsState, []);
        set(selectedFilterState, undefined);
      },
    [
      objectFilterDropdownSearchInputState,
      objectFilterDropdownSelectedRecordIdsState,
      selectedFilterState,
    ],
  );

  const setObjectFilterDropdownFilterIsSelectedCallbackState =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownFilterIsSelectedComponentState,
      props?.filterDropdownId,
    );

  const setObjectFilterDropdownIsSelectingCompositeFieldCallbackState =
    useRecoilComponentCallbackStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
      props?.filterDropdownId,
    );

  const resetFilter = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectFilterDropdownSearchInputState, '');
        set(objectFilterDropdownSelectedRecordIdsState, []);
        set(selectedFilterState, undefined);
        set(filterDefinitionUsedInDropdownState, null);
        set(selectedOperandInDropdownState, null);
        set(setObjectFilterDropdownFilterIsSelectedCallbackState, false);
        set(
          setObjectFilterDropdownIsSelectingCompositeFieldCallbackState,
          false,
        );
      },
    [
      filterDefinitionUsedInDropdownState,
      objectFilterDropdownSearchInputState,
      objectFilterDropdownSelectedRecordIdsState,
      selectedFilterState,
      selectedOperandInDropdownState,
      setObjectFilterDropdownFilterIsSelectedCallbackState,
      setObjectFilterDropdownIsSelectingCompositeFieldCallbackState,
    ],
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
  const setAdvancedFilterViewFilterGroupId = useSetRecoilState(
    advancedFilterViewFilterGroupIdState,
  );
  const setAdvancedFilterViewFilterId = useSetRecoilState(
    advancedFilterViewFilterIdState,
  );

  return {
    scopeId,
    selectFilter,
    resetFilter,
    setSelectedFilter,
    setSelectedOperandInDropdown,
    setFilterDefinitionUsedInDropdown,
    setObjectFilterDropdownSearchInput,
    setObjectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedOptionValues,
    setIsObjectFilterDropdownOperandSelectUnfolded,
    setIsObjectFilterDropdownUnfolded,
    setAdvancedFilterViewFilterGroupId,
    setAdvancedFilterViewFilterId,
    emptyFilterButKeepDefinition,
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    objectFilterDropdownSelectedRecordIdsState,
    objectFilterDropdownSelectedOptionValuesState,
    isObjectFilterDropdownOperandSelectUnfoldedState,
    isObjectFilterDropdownUnfoldedState,
    selectedFilterState,
    selectedOperandInDropdownState,
    advancedFilterViewFilterGroupIdState,
    advancedFilterViewFilterIdState,
  };
};
