import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { advancedFilterViewFilterGroupIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterGroupIdComponentState';
import { advancedFilterViewFilterIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterIdComponentState';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';

import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isDefined } from 'twenty-shared';
import { v4 } from 'uuid';

type SelectFilterParams = {
  fieldMetadataItemId: string;
};

export const useSelectFilterUsedInDropdown = (componentInstanceId?: string) => {
  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
    componentInstanceId,
  );

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
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

  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const selectFilterUsedInDropdown = ({
    fieldMetadataItemId,
  }: SelectFilterParams) => {
    setFieldMetadataItemIdUsedInDropdown(fieldMetadataItemId);

    const fieldMetadataItem = getFieldMetadataItemById(fieldMetadataItemId);

    if (!isDefined(fieldMetadataItem)) {
      return;
    }

    if (
      fieldMetadataItem.type === 'RELATION' ||
      fieldMetadataItem.type === 'SELECT'
    ) {
      setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
    }

    const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

    const firstOperand = getRecordFilterOperands({
      filterType,
    })[0];

    setSelectedOperandInDropdown(firstOperand);

    const { value, displayValue } = getInitialFilterValue(
      filterType,
      firstOperand,
    );

    const isAdvancedFilter = isDefined(advancedFilterViewFilterId);

    if (isAdvancedFilter || value !== '') {
      applyRecordFilter({
        id: advancedFilterViewFilterId ?? v4(),
        fieldMetadataId: fieldMetadataItem.id,
        displayValue,
        operand: firstOperand,
        value,
        viewFilterGroupId: advancedFilterViewFilterGroupId,
        type: filterType,
        label: fieldMetadataItem.label,
      });
    }

    setObjectFilterDropdownSearchInput('');
  };

  return {
    selectFilterUsedInDropdown,
  };
};
