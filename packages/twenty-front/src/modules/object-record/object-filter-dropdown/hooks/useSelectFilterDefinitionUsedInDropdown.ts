import { advancedFilterViewFilterGroupIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterGroupIdComponentState';
import { advancedFilterViewFilterIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterIdComponentState';
import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { getRecordFilterOperandsForRecordFilterDefinition } from '@/object-record/record-filter/utils/getRecordFilterOperandsForRecordFilterDefinition';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isDefined } from 'twenty-ui';
import { v4 } from 'uuid';

type SelectFilterParams = {
  filterDefinition: RecordFilterDefinition;
};

export const useSelectFilterDefinitionUsedInDropdown = (
  componentInstanceId?: string,
) => {
  const setFilterDefinitionUsedInDropdown = useSetRecoilComponentStateV2(
    filterDefinitionUsedInDropdownComponentState,
    componentInstanceId,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
    componentInstanceId,
  );

  const setObjectFilterDropdownSearchInput = useSetRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
    componentInstanceId,
  );

  const advancedFilterViewFilterGroupId = useRecoilComponentValueV2(
    advancedFilterViewFilterGroupIdComponentState,
    componentInstanceId,
  );

  const advancedFilterViewFilterId = useRecoilComponentValueV2(
    advancedFilterViewFilterIdComponentState,
    componentInstanceId,
  );

  const setHotkeyScope = useSetHotkeyScope();

  const { applyRecordFilter } = useApplyRecordFilter(componentInstanceId);

  const selectFilterDefinitionUsedInDropdown = ({
    filterDefinition,
  }: SelectFilterParams) => {
    setFilterDefinitionUsedInDropdown(filterDefinition);

    if (
      filterDefinition.type === 'RELATION' ||
      filterDefinition.type === 'SELECT'
    ) {
      setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
    }

    setSelectedOperandInDropdown(
      getRecordFilterOperandsForRecordFilterDefinition(filterDefinition)[0],
    );

    const { value, displayValue } = getInitialFilterValue(
      filterDefinition.type,
      getRecordFilterOperandsForRecordFilterDefinition(filterDefinition)[0],
    );

    const isAdvancedFilter = isDefined(advancedFilterViewFilterId);

    if (isAdvancedFilter || value !== '') {
      applyRecordFilter({
        id: advancedFilterViewFilterId ?? v4(),
        fieldMetadataId: filterDefinition.fieldMetadataId,
        displayValue,
        operand:
          getRecordFilterOperandsForRecordFilterDefinition(filterDefinition)[0],
        value,
        definition: filterDefinition,
        viewFilterGroupId: advancedFilterViewFilterGroupId,
      });
    }

    setObjectFilterDropdownSearchInput('');
  };

  return {
    selectFilterDefinitionUsedInDropdown,
  };
};
