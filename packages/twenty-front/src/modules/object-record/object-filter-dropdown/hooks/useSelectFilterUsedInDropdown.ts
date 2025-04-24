import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { SingleRecordPickerHotkeyScope } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerHotkeyScope';

import { getDefaultSubFieldNameForCompositeFilterableFieldType } from '@/object-record/record-filter/utils/getDefaultSubFieldNameForCompositeFilterableFieldType';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isDefined } from 'twenty-shared/utils';
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
      setHotkeyScope(SingleRecordPickerHotkeyScope.SingleRecordPicker);
    }

    const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

    const defaultSubFieldName =
      getDefaultSubFieldNameForCompositeFilterableFieldType(filterType);

    const firstOperand = getRecordFilterOperands({
      filterType,
      subFieldName: defaultSubFieldName,
    })[0];

    setSelectedOperandInDropdown(firstOperand);

    const { value, displayValue } = getInitialFilterValue(
      filterType,
      firstOperand,
    );

    if (value !== '') {
      applyRecordFilter({
        id: v4(),
        fieldMetadataId: fieldMetadataItem.id,
        displayValue,
        operand: firstOperand,
        value,
        type: filterType,
        label: fieldMetadataItem.label,
        subFieldName: defaultSubFieldName,
      });
    }

    setObjectFilterDropdownSearchInput('');
  };

  return {
    selectFilterUsedInDropdown,
  };
};
