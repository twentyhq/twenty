import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useFilterDropdownStates } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdownStates';

import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

type UseFilterDropdownProps = {
  filterDropdownId?: string;
};

export const useFilterDropdown = (props?: UseFilterDropdownProps) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    ObjectFilterDropdownComponentInstanceContext,
    props?.filterDropdownId,
  );

  const {
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    objectFilterDropdownSelectedRecordIdsState,
    objectFilterDropdownSelectedOptionValuesState,
    selectedFilterState,
    selectedOperandInDropdownState,
    onFilterSelectState,
    advancedFilterViewFilterGroupIdState,
    advancedFilterViewFilterIdState,
  } = useFilterDropdownStates(componentInstanceId);

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

  const setOnFilterSelect = useSetRecoilState(onFilterSelectState);
  const setAdvancedFilterViewFilterGroupId = useSetRecoilState(
    advancedFilterViewFilterGroupIdState,
  );
  const setAdvancedFilterViewFilterId = useSetRecoilState(
    advancedFilterViewFilterIdState,
  );

  return {
    componentInstanceId,
    resetFilter,
    setSelectedFilter,
    setSelectedOperandInDropdown,
    setFilterDefinitionUsedInDropdown,
    setObjectFilterDropdownSearchInput,
    setObjectFilterDropdownSelectedRecordIds,
    setObjectFilterDropdownSelectedOptionValues,
    setOnFilterSelect,
    setAdvancedFilterViewFilterGroupId,
    setAdvancedFilterViewFilterId,
    emptyFilterButKeepDefinition,
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
