import { useState } from 'react';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { v4 } from 'uuid';

export const AdvancedFilterDropdownTextInput = () => {
  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter();

  const [inputValue, setInputValue] = useState(
    () => selectedFilter?.value || '',
  );

  const handleChange = (newValue: string) => {
    if (!fieldMetadataItemUsedInDropdown || !selectedOperandInDropdown) {
      return;
    }

    setInputValue(newValue);

    applyRecordFilter({
      id: selectedFilter?.id ? selectedFilter.id : v4(),
      fieldMetadataId: fieldMetadataItemUsedInDropdown?.id ?? '',
      value: newValue,
      operand: selectedOperandInDropdown,
      displayValue: newValue,
      type: getFilterTypeFromFieldType(fieldMetadataItemUsedInDropdown.type),
      label: fieldMetadataItemUsedInDropdown.label,
      recordFilterGroupId: selectedFilter?.recordFilterGroupId,
      positionInRecordFilterGroup: selectedFilter?.positionInRecordFilterGroup,
    });
  };

  if (!selectedOperandInDropdown || !fieldMetadataItemUsedInDropdown) {
    return null;
  }

  return (
    <TextInputV2
      value={inputValue}
      onChange={handleChange}
      placeholder="Enter value"
      fullWidth
    />
  );
};
